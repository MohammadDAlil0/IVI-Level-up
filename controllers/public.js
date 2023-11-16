const User = require('../models/user');
const axios = require('axios');

exports.getProfileInfo = (req, res, next) => {
   const name = req.body.name;

   var curUser;
   User.findOne({name: name})
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
        res.status(200).json({
            message: 'getting user info successed!',
            data: {
                id: curUser._id,
                name: curUser.name,
                email: curUser.email,
                brief: curUser.brief,
                codeforcesHandle: curUser.codeforcesHandle,
                handles: curUser.handles,
                folders: curUser.folders.filter(f => f.visible === true),
                friends: curUser.friends,
                numOfSolvedProblems : numOfSolvedProblems,
                points: points             
            }
        });
   })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'there is a problem in our server, we will try to fix it as soon as possible!'
        });
   })
}

exports.searchForUser = (req, res, next) => {
    const handle = req.body.codeforcesHandle;
    User.findOne({codeforcesHandle: handle})
    .then(user => {
        if (!user) {
            return res.status(404).json({
                message: 'there is no such user!'
            });
        }
        res.status(200).json({
            userId: user._id,
            message: 'getting user successed!'
        });
    });
}