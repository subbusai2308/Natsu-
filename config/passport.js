const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

require('../models/Users');
const Users = mongoose.model('users');

module.exports = function (passport) {
    passport.use(new LocalStrategy({
        usernameField: 'email'
    }, (email, password, done) => {
        Users.findOne({
                email: email
            })
            .then((user) => {
                if (!user) {
                    return done(null, false, {
                        message: "This email is not registered"
                    });
                } else {
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err)
                            throw err
                        if (isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, {
                                message: "Password incorrect"
                            });
                        }
                    });
                }
            }).catch(err => console.log(err));
    }));
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        Users.findById(id, function (err, user) {
            done(err, user);
        });
    });
}