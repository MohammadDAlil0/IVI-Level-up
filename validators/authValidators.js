const {body} = require('express-validator');
const User = require('../models/user');
const axios = require('axios');

exports.signup = [
    body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email')
    .normalizeEmail({all_lowercase: true})
    .custom((value, {req}) => {
        return User.findOne({email: value})
        .then(user => {
            if (user) {
                return Promise.reject('there is such an email before');
            }
            return true;
        });
    }),
    body('password')
    .trim()
    .isLength({min: 8, max: 32})
    .withMessage('the length of the password should consists of at least 8 characters and at most 32 characters'),
    body("name")
    .toLowerCase(),
    body("codeforcesHandle")
    .trim()
    .custom((value, {req}) => {
        const handle = value;
        return User.findOne({codeforcesHandle: handle})
        .then(user => {
            if (user) {
                return Promise.reject('there is a user has such handle!');
            }
            const url = `https://codeforces.com/api/user.info?handles=${handle}`;
            return axios.get(url)
            .then(ans => {
                if (ans.data.status == 'OK')
                    return true;
                else
                    return Promise.reject('problem while using an Api from codeforces to check the handle!');
            })
            .catch(err => {
                return Promise.reject("there is no such Handle in codeforces!");
            })
        })   
    })
]