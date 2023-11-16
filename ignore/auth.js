const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "0f4fc58dc7e303",
        pass: "fdb7334ad3b2d7"
    }
});

exports.postSignup = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const handles = req.body.handles;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: errors.errors[0].msg,
            errorsArray: errors.errorsxd
        });
    }
    bcrypt.hash(password, 12)
    .then(hashedPassword => {
        let token;
        crypto.randomBytes(32, (err, Buffer) => {
            if (err) {
                console.log(err);
                const error = new Error('there was a problem in our server while it was generating a token for verification step');
                error.statusCode = 500;
                error.data = err
                next(error);
            }
            return Buffer.toString('hex');
        })
        const user = new User({
            name: name,
            email: email,
            password: hashedPassword,
            handles: handles,
            vtoken: token,
            vtokenDate: new Date() + 3600000
        });
        transport.sendMail({
            from : 'ourName@fourthProject.com',
            to: email,
            subject: 'Verifivation step',
            html: `
            <h1> this message to verify your email </h1>
            <hr>
            <p> please Enter <a href="http://localhost:5000/auth/signup/${token}"> here </a> to verify your email </p>
            `
        })
        .catch(err => console.log("the mail wasn\'t sent"));
        return user.save()
    })
    .then(user => {
        res.status(201).json({
            message: 'Inserted Successfully!',
            user: user
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'there is a problem in our server, we will try to fix it as soon as possible!'
        })
    });
    
}