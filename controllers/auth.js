const User = require('../models/user');
const bcrypt = require('bcryptjs');
const {validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const axios = require('axios');

exports.postSignup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: errors.array()[0].msg,
            errorsArray: errors.array()
        });
    }
    
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const codeforcesHandle = req.body.codeforcesHandle;
    
    bcrypt.hash(password, 12)
    .then(hashedPassword => {
        const user = new User({
            name: name,
            email: email,
            password: hashedPassword,
            codeforcesHandle: codeforcesHandle
        });
        return user.save();
    })
    .then(user => {
        res.status(201).json({
            message: 'Inserted Successfully!'
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'there is a problem in our server, we will try to fix it as soon as possible!'
        })
    });    
}

exports.postSignin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email: email})
    .then(user => {
        if (!user) {
            return res.status(401).json({
                message: 'there is no such an email'
            });
        }
        bcrypt.compare(password, user.password)
        .then(isMatched => {
            if (!isMatched) {
                return res.status(403).json({
                    message: 'Invalied password!'
                });
            }
            const token = jwt.sign({
                email: user.email,
                userId: user._id.toString()
            },
            'mysecretisblazerosbla',
            { expiresIn: '1000h'}
            );
            user.password = '';
            res.status(200).json({
                token: token,
                userId: user
            });
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'there is a problem in our server, we will try to fix it as soon as possible!'
        })
    });
}

exports.hasCodeforces = (req, res, next) => {
    const handle = req.body.codeforcesHandle;
    const url = `https://codeforces.com/api/user.info?handles=${handle}`;
    axios.get(url)
    .then(ans => {
        if (ans.data.status == 'OK')
            res.status(200).json({
                hasAccount: true
            });
        else
            res.status(500).json({
                message: 'there is a problem'
            });
    })
    .catch(err => {
        res.status(404).json({
            hasAccount: false
        });
    })

}