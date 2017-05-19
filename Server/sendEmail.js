const nodemailer = require('nodemailer');
const error = require('./error');

let transporter = nodemailer.createTransport(
    {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'ml.servu@gmail.com',
            pass: 'flofloflo'
        }
    }
);

exports.sendMailInscription = function(username, email) {
    transporter.verify(function(error, success) {
        if (error) {
            new error.error(421, "Erreur envoi email");
        } else {
            let mailOptions = {
                from: '"ServU" <ml.servu@gmail.com>',
                to: email,
                subject: "Welcome to ServU",
                text: "Welcome " + username + "\nWe are realy pleased by your subscription. Use ServU to configure different event on your smartphone. Please download our mobile application to add a device." +
                "\n\n Enjoy ServU",
                html: '<b>' + "Welcome " + username +'<br><br>'+"We are realy pleased by your subscription. Use ServU to configure different event on your smartphone. Please download our mobile application to add a device."
                +'<br><br>'+"Enjoy ServU"+ '</b>'
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    return error.error(441, "Erreur envoi email");
                }
            });

        }
    })
};


exports.sendMailPassword = function(username, email, password) {
    return new Promise((resolve, reject) => {
        transporter.verify(function (error, success) {
            if (error) {
                reject(error.error(421, "Erreur envoi email", error));
            } else {
                let mailOptions = {
                    from: '"ServU" <ml.servu@gmail.com>',
                    to: email,
                    subject: "Change Password",
                    text: "Welcome " + username + "\nWe changed your password as requested.\nNew password :" + password + "\nPlease, change this password after your connection."
                    + '<br><br>' + "Enjoy ServU",
                    html: '<b>' + "Welcome " + username + '<br><br>' + "We changed your password as requested." + '<br>' + "New password : " + password + '<br>' + "Please, change this password after your connection."
                    + '<br><br>' + "Enjoy ServU" + '</b>'
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        reject(error.error(441, "Erreur envoi email", error));
                    }
                    else resolve();
                });

            }
        })
    })
};