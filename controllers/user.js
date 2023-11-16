const User = require('../models/user');
const mongoose = require("mongoose");
const {validationResult} = require('express-validator');
const axios = require('axios');
const STATUS_CODE = {
    NOT_FOUND : 404,
    BAD_REQUEST : 400,
    SUCCESS : 200,
    FORBIDDEN : 403,
    UNAUTHORIZE : 401,
    DELETED : 204,
    CREATED : 201,
    INTERNAL_SERVER_ERROR : 500,
}

exports.postAddFolder = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: errors.array()[0].msg,
            errorsArray: errors.array()
        });
    }
    const userId = req.userId;
    const folderName = req.body.folderName;
    const visible = req.body.visible;
    var color = req.body.color;
    if (color == "") {
        color = "#000000";
    }
    User.findById(userId)
    .then(user => {
        const newFolder = {
            name: folderName,
            problems: [],
            visible: visible,
            color: color
        }
        user.folders.push(newFolder);
        return user.save()
    })
    .then(() => {
        res.status(201)
        .json({
            message: 'the folder added Successfully!'
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'there is a problem in our server, we will try to fix it as soon as possible!'
        });
    });
}

exports.removeFolder = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: errors.array()[0].msg,
            errorsArray: errors.array()
        });
    }
    const userId = req.userId;
    const folderId = req.params.folderId;

    User.findOne({_id: userId})
    .then(user => {
        user.folders = user.folders.filter(f => f._id.toString() != folderId.toString());
        return user.save();
    })
    .then((ans) => {
        res.status(204).json({
            message: 'OK'
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'there is a problem in our server, we will try to fix it as soon as possible!'
        });
    });
}

exports.postAddProblem = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: errors.array()[0].msg,
            errorsArray: errors.array()
        });
    }
    const folderId = req.body.folderId;
    const problemId = req.body.problemId;

    const name = req.body.name;
    const tags = req.body.tags;
    const description = req.body.description;
    const problemCode = problemId.slice(-1);
    const contestId = problemId.slice(0, -1);
    var newProblemInfo = {
        idProblem: problemId,
        name: name,
        hints: [],
        tags: tags,
        description: description
    };

    return axios.get(`https://codeforces.com/api/contest.standings?contestId=${contestId}&from=1&count=9&showUnofficial=true`)
    .then(response => {
        const problem = response.data.result.problems.find(p => p.index === problemCode);
        if (!problem) {
           throw new Error('No such problem in this contest');
        }
        if (!newProblemInfo.name)
            newProblemInfo.name = problem.name;
        if (!newProblemInfo.tags)
            newProblemInfo.tags = problem.tags;
    })
    .then(() => {
        User.findOneAndUpdate(
            { _id: req.userId, 'folders._id': folderId },
            { $push: { 'folders.$.problems': newProblemInfo} },
            { new: true }
        )
        .then(newUser => {
            res.status(201).json({
                folders: newUser.folders,
                message: 'the problem inserted successfuly!'
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'there is a problem in our server, we will try to fix it as soon as possible!'
            });
        });
    })
    .catch(err => {
        const error = new Error('there is a problem in the codeforces\' API');
        error.statusCode = 501;
        error.data = err;
        next(error);
    });
    
}

exports.removeProblem = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: errors.array()[0].msg,
            errorsArray: errors.array()
        });
    }
    const folderId = req.params.folderId;
    const problemId = req.params.problemId;

    User.findOne({_id: req.userId})
    .then(user => {
        user.folders.forEach(f => {
            if (f._id.toString() == folderId.toString()) {
                f.problems = f.problems.filter(p => p._id.toString() != problemId.toString());
            }
        });
        return user.save();
    })
    .then(() => {
        res.status(204).json({
            message: 'problem removed successfully!'
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'there is a problem in our server, we will try to fix it as soon as possible!'
        });
    })

}


exports.getFolders = (req, res, next) => {
    User.findOne({_id: req.userId})
    .then(user => {
        if (!user) {
            return res.status(401).json({
                message: 'there is a problem in the Autherization'
            });
        }
        res.status(200).json({
            folders: user.folders,
            message: 'getting folders successeed'
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'there is a problem in our server, we will try to fix it as soon as possible!'
        });
    });
}

exports.postAddFriend = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: errors.array()[0].msg,
            errorsArray: errors.array()
        });
    }
    
    const friendId = req.body.friendId;
    User.findOne({_id: req.userId})
    .then(user => {
        user.friends.push(friendId);
        user.save()
        .then(() => {
            res.status(201).json({
                message: 'adding a frined succssed!'
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'there is a problem in our server, we will try to fix it as soon as possible!'
            }); 
        })
    })
    .catch(err => {
        res.status(500).json({
            message: 'there is a problem in our server, we will try to fix it as soon as possible!'
        });
    })
}

exports.suggestProblems = (req, res, next) => {
    const userId = req.userId;
    User.findOne({_id: userId})
    .then(user => {
        if (!user) {
            return res.status(401).json({
                message: 'there is a problem in the Autherization'
            });
        }
        if (!user.friends.length) {
            return res.json({
                message: "Getting problems successed!",
                problems: []
            });
        }
        var ret = [];
        User.find({_id: {$in: user.friends.toString().split(',')}})
        .then(users => {
            for (let x = 0 ; x < users.length ; ++x) {
                users[x].folders.forEach(f => {
                    if (f.visible)
                    {
                        for (let y = 0 ; y < f.problems.length; ++y) {
                            let myProblem = f.problems[y];
                            let newHints = [], lastHint;
                            for (let z = 0; z < myProblem.hints.length; ++z) {
                                const help = myProblem.hints[z].whoPaied.find(wh => wh.toString() == req.userId.toString());
                                if (!help) {
                                    lastHint = {
                                        idTheLastHint: myProblem.hints[z]._id,
                                        price: myProblem.hints[z].price
                                    };
                                    break;
                                }
                                newHints.push(myProblem.hints[z]);
                            }
                            myProblem.hints = newHints; 
                            ret.push({
                                from: users[x].name,
                                fromId: users[x]._id,
                                folderName: f.name,
                                problem: myProblem,
                                lastHint: lastHint
                            });
                        }
                    }
                });
            }
            ret.sort(function(a,b) {
                return (a.problem.value > b.problem.value ? -1 : 1);
            });
            return axios.get(`https://codeforces.com/api/user.status?handle=${user.codeforcesHandle}`);
        })
        .then(data => {
            data = data.data.result;
            for (let i = 0; i < ret.length; ++i) {
                for (let j = 0; j < data.length; ++j) {
                    let s = data[j].problem.contestId + data[j].problem.index;
                    if (ret[i].problem.idProblem == s.toString()) {
                        ret[i].verdict = data[j].verdict;
                    }
                }
            }

            res.status(200).json({
                message: "Getting problems successed!",
                problems: ret
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'there is a problem in our server, we will try to fix it as soon as possible!'
            });
        });
    })
}

exports.getProfileInfo = (req, res, next) => {
    const id = (req.params.id ? req.params.id: req.userId);
    
    var ans = {}, curUser;
    User.findOne({_id: id})
    .then(user => {
        if (!user) {
            return res.status(404).json({
                message: 'there is no such user'
            });
        }
        curUser = user;
        return axios.get(`https://codeforces.com/api/user.status?handle=${user.codeforcesHandle}`);
    })
    .then((data) => {
        data = data.data.result;
        let numOfSolvedProblems = 0, points = 0;
        for (let i = 0 ; i < data.length; ++i) {
            if (data[i].verdict == 'OK') {
                numOfSolvedProblems++;
                if (data[i].problem.rating)
                    points += data[i].problem.rating / 100;
            }
        }
        ans = {
            id: curUser._id,
            name: curUser.name,
            email: curUser.email,
            bio: curUser.bio,
            codeforcesHandle: curUser.codeforcesHandle,
            handles: curUser.handles,
            folders: curUser.folders,
            friends: curUser.friends,
            numOfSolvedProblems : numOfSolvedProblems,
            points: points - curUser.paied,
            rating: null,
            imageUrl: null
        }
        return axios.get(`https://codeforces.com/api/user.info?handles=${curUser.codeforcesHandle}`);
    })
    .then(data => {
        ans.rating = data.data.result[0].rating;
        ans.imageUrl = data.data.result[0].titlePhoto;
        return User.findOne({_id: req.userId});
    })
    .then((user) => {
        return axios.get(`https://codeforces.com/api/user.status?handle=${user.codeforcesHandle}`);
    })
   .then((data) => {
        data = data.data.result;
        for (let i = 0 ; i < ans.folders.length; ++i) {
            let cnt = 0;
            for (let j = 0; j < ans.folders[i].problems.length; ++j) {
                for (let k = 0 ; k < data.length; ++k) {
                    let s = data[k].problem.contestId + data[k].problem.index;
                    if (ans.folders[i].problems[j].idProblem.toString() == s.toString()) {
                        ans.folders[i].problems[j].verdict = data[k].verdict;
                        if (data[k].verdict == 'OK')
                            cnt++;
                        break;
                    }
                }
            }
            ans.folders[i].solved = cnt;
        }
        if (req.userId.toString() != curUser._id.toString()) {
                ans.folders = ans.folders.filter(f => f.visible === true)
        }
        res.status(200).json({
            message: 'getting user info successed!',
            data: ans   
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'there is a problem in our server, we will try to fix it as soon as possible!'
        });
    })
}

exports.editProblemVotes = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: errors.array()[0].msg,
            errorsArray: errors.array()
        });
    }

    const userId = req.body.userId;
    const folderName = req.body.folderName;
    const problemId = req.body.problemId;
    const upVote = req.body.upVote;
    

    User.findOne({_id: userId})
    .then(user => {
        const curFolderIndex = user.folders.findIndex(f => f.name == folderName);
        const curProblemIndex = user.folders[curFolderIndex].problems.findIndex(p => p.idProblem == problemId);
        const userVote = user.folders[curFolderIndex].problems[curProblemIndex].votes.find(v => v._id.toString() == req.userId.toString());
        
        if (userVote) {
            if (upVote != userVote.typeOfVotes) {
                user.folders[curFolderIndex].problems[curProblemIndex].value += (userVote.typeOfVotes == 1 ? -2 : 2);
                userVote.typeOfVotes = (userVote.typeOfVotes == 1 ? -1 : 1);
            }
            return user.save();
        }

        if (upVote == 1)
            user.folders[curFolderIndex].problems[curProblemIndex].value++;
        else   
            user.folders[curFolderIndex].problems[curProblemIndex].value--;

        user.folders[curFolderIndex].problems[curProblemIndex].votes.push({
            _id: req.userId,
            typeOfVotes: upVote
        })

        return user.save();
    })
    .then(ans => {
        res.json({
            message: 'upvoting successed!',
            newUser: ans
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'there is a problem in our server, we will try to fix it as soon as possible!'
        });
    })
}

exports.addBio = (req, res, next) => {
    const bio = req.body.bio;
    User.findOne({_id: req.userId})
    .then(user => {
        if (!user) {
            return res.json({
                message: 'there is a problem in the Autherization'
            });
        }
        user.bio = bio;
        user.save()
        .then(() => {
            res.json({
                message: 'the bio added successfuly!'
            });
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'there is a problem in our server, we will try to fix it as soon as possible!'
        });
    })
}

exports.addHint = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: errors.array()[0].msg,
            errorsArray: errors.array()
        });
    }

    const folderId = req.body.folderId;
    const problemId = req.body.problemId;
    const content = req.body.content;
    const price = req.body.price;
    User.findOne({_id: req.userId})
    .then(user => {
        const curFolder = user.folders.find(f => f._id.toString() == folderId);
        const curProblem = curFolder.problems.find(p => p._id == problemId);
        curProblem.hints.push({
            content: content,
            price: price,
            whoPaied: []
        });
        return user.save();
    })
    .then((ans) => {
        res.status(201).json({
            message: 'add hint successfully!'
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'there is a problem in our server, we will try to fix it as soon as possible!'
        });
    })
}

exports.buyHint = (req, res, next) => {
    const fromUserId = req.body.fromUserId;
    const fromFolderName = req.body.fromFolderName;
    const fromProblemId = req.body.fromProblemId;
    const idHint = req.body.idHint;
    let points = 0;
    

    User.findOne({_id: req.userId})
    .then(user => {
        if (!user) {
            return res.json({
                message: 'there is a problem in the Autherization'
            });
        }
        axios.get(`https://codeforces.com/api/user.status?handle=${user.codeforcesHandle}`)
        .then((data) => {
            data = data.data.result;
            for (let i = 0 ; i < data.length; ++i) {
                if (data[i].verdict == 'OK') {
                    if (data[i].problem.rating)
                        points += data[i].problem.rating / 100;
                }
            }
            return User.findOne({_id: fromUserId});
        })
        .then((fromUser) => {
            const fromFolder = fromUser.folders.find(f => f.name == fromFolderName);
            const fromProblem = fromFolder.problems.find(p => p._id.toString() == fromProblemId);
            const curHint = fromProblem.hints.find(h => h._id.toString() == idHint.toString());
            if (user.paied + curHint.price <= points) {
                user.paied += curHint.price;
                curHint.whoPaied.push(user._id);
                fromUser.save()
                .then(() => {
                    res.status(201).json({
                        message: 'hint added successfully!'
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        message: 'there is a problem in our server, we will try to fix it as soon as possible!'
                    });
                })
            } else {
                res.status(401).json({
                    message: 'does not have enough points!'
                });
            }
        })
    })
}