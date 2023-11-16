const {body, param} = require('express-validator');
const User = require('../models/user');

exports.addFloder = [
    body('folderName')
    .toLowerCase()
    .trim()
    .custom((value, {req}) => {
        return User.findOne({_id: req.userId})
        .then(user => {
            
            if (!user) {
                return Promise.reject('there is a problem in authorization');
            }
            const curFolder = user.folders.find(f => f.name === value);
            if (curFolder) {
                return Promise.reject('it is already exist');
            }
            return true;
        });
    })
]

exports.removeFolder = [
    param('folderId')
    .trim()
    .custom((value, {req}) => {
        return User.findOne({_id: req.userId})
        .then(user => {
            if (!user) {
                return Promise.reject('there is a problem in authorization');
            }
            const curFolder = user.folders.find(f => f._id.toString() === value.toString());
            if (!curFolder) {
                return Promise.reject('there is no such folder!');
            }
            return true;
        });
    })
]

exports.addProblem = [
    body('folderId')
    .toLowerCase()
    .trim()
    .custom((value, {req}) => {
        return User.findOne({_id: req.userId})
        .then(user => {
            if (!user) {
                return Promise.reject('there is a problem in authorization');
            }
            const curFolder = user.folders.find(f => f._id.toString() === value.toString());
            if (!curFolder) {
                return Promise.reject('the folder is not exist');
            }
            const curProblem = curFolder.problems.find(p => p.idProblem == req.body.problemId);
            if (curProblem) {
                return Promise.reject('the problem is already exist inside the folder!');
            }
            return true;
        })
    })
]

exports.removeProblem =[
    param('folderId')
    .toLowerCase()
    .trim()
    .custom((value, {req}) => {
        return User.findOne({_id: req.userId})
        .then(user => {
            if (!user) {
                return Promise.reject('there is a problem in authorization');
            }
            const curFolder = user.folders.find(f => f._id.toString() === value.toString());
            if (!curFolder) {
                return Promise.reject('the folder is not exist');
            }
            const curProblem = curFolder.problems.find(p => p._id.toString() == req.params.problemId.toString());
            if (!curProblem) {
                return Promise.reject('the problem is not exist!');
            }
            return true;
        })
    })
]

exports.addFriend = [
    body('friendId')
    .trim()
    .custom((value, {req}) => {
        return User.findOne({_id: req.userId})
        .then(user => {
            if (!user) {
                return Promise.reject('there is a problem in authorization');
            }
            return User.findOne({_id: value})
            .then(fUser => {
                if (!fUser) {
                    return Promise.reject('there is no such user');
                }
                const isFriend = user.friends.find(f => f.toString() === value.toString());
                if(isFriend) {
                    return Promise.reject('this user is a friend already');
                }
                return true;
            });
        });
    })
]

exports.editProblemVotes = [
    body('userId')
    .trim()
    .custom((value, {req}) => {
        return User.findOne({_id: value})
        .then(user => {
            if (!user) {
                return Promise.reject('there is no such user!');
            }
            const curFolder = user.folders.find(f => f.name == req.body.folderName);
            if (!curFolder) {
                return Promise.reject('the folder is not exist');
            }
            const curProblem = curFolder.problems.find(p => p.idProblem == req.body.problemId);
            if (!curProblem) {
                return Promise.reject('the Problem is not exist');
            }
            return true;
        });
    })
]

exports.addHint = [
    body('folderId')
    .trim()
    .custom((value, {req}) => {
        return User.findOne({_id: req.userId})
        .then(user => {
            if (!user) {
                return Promise.reject('there is no such user!');
            }
            const curFolder = user.folders.find(f => f._id.toString() == value);
            if (!curFolder) {
                return Promise.reject('the folder is not exist');
            }
            const curProblem = curFolder.problems.find(p => p._id.toString() == req.body.problemId);
            if (!curProblem) {
                return Promise.reject('the Problem is not exist');
            }
            return true;
        });
    })
]