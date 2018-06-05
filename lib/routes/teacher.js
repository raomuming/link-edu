
let Teacher = require('../models/teacher.js');
let Async = require('async');
const random = require('../utils/random');
const Base64 = require('../utils/base64');
let crypto = require('crypto');

module.exports = function (app) {
    console.log('register teacher routes.');

    // for teacher register
    app.post('/t/register', function(req, res){
        console.log(req.body);

        // generate 8-letters random
        let randomWord = random(false, 8);
        let base64 = new Base64();

        //
        let base64Random = base64.encode(randomWord)

        let phoneNumber = req.body.phone_number;
        let password = req.body.password;

        let newPas = base64Random + password;
        let md5 = crypto.createHash('md5');

        let md5Pas = md5.update(newPas).digest('hex');

        let base64Md5 = base64.encode(md5Pas);

        let lastPassword = base64Random + base64Md5;

        console.log('save new teacher to db.');

        let teacher = new Teacher({
            phone_number: phoneNumber,
            password: lastPassword
        });

        teacher.save((error, teacher) => {
            if (error) {
                console.log('error when save teacher => ', JSON.stringify(error));
                res.status(403).send(error);
            } else {
                console.log('new teacher saved to db => ', JSON.stringify(teacher));
                res.status(200).send(teacher);
            }
        });
    });

    // login with phone number & password
    app.post('/t/login', function (req, res) {
        console.log('login user => ', req.body);
        let phoneNumber = req.body.phone_number;
        let password = req.body.password;

        if (!phoneNumber || !password) {
            res.send({
                error: {
                    code: 101,
                    message: 'the phoneNumber or password is empty'
                }
            });
            return;
        }

        Teacher.find({phone_number: phoneNumber}, (error, teachers) => {
            if (error) {
                res.send(error);
            }
            else {
                let teacher = teachers[0];

                console.log(teacher);

                let base64Random = teacher.password.substring(0, 12);
                let newPas = base64Random + password;

                let md5 = crypto.createHash("md5");
                let md5Pas = md5.update(newPas).digest("hex");

                let base64 = new Base64();
                let base64Md5 = base64.encode(md5Pas);

                let lastPassword = base64Random + base64Md5;

                if (teacher.password === lastPassword) {
                    res.send(teacher);
                } else {
                    res.send({
                        error: {
                            code: 102,
                            message: 'the phoneNumber or password is incorrect'
                        }
                    });
                }
            }
        });
    });
};