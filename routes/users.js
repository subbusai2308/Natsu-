const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport=require('passport');
const router = express.Router();

//mongoose modle exporting
require('../models/Users');
const Users = mongoose.model('users');

//User Route
router.get('/login', (req, res) => {
    res.render('users/login');
});
router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
        successRedirect:'/ideas',
        failureRedirect:'/users/login',
        failureFlash:true
    })(req,res,next);
});

router.get('/logout',(req,res)=>{
    req.logOut();
    req.flash('success_msg','Logged Out Successfully');
    res.redirect('/users/login');
});


router.post('/register', (req, res) => {
    const {name,email,password,password2} = req.body;
    let errors = []
    if (!name || !email || !password || !password2) {
        errors.push({text: 'All Fields Must Be Filled Out'});
    }
    if (password.length < 6) {
        errors.push({text: 'Password Is Too Short'});
    }
    if (password != password2) {
        errors.push({text: 'Password And Confirm Password Must Be Equal'});
    }
    if (errors.length > 0) {
     res.render('users/register', {errors: errors,name: name,email: email,password: password,password2: password2});
    } else {
        Users.findOne({email:email})
            .then((users) => {
                if (!users) {
                    const newUser = {
                        name: name,
                        email: email,
                        password: password
                    }
                    console.log(newUser);
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            newUser.password = hash;
                            new Users(newUser)
                                .save()
                                .then((users) => {
                                    req.flash('success_msg', 'Registered Successfully')
                                    res.redirect('/users/login')
                                }).catch(err => console.log(err));
                        });
                    });
                }else{
                    req.flash('error_msg','User Alreay Exist');
                    res.redirect('/users/register');
                }
            }).catch(err=>console.log(err));
    }
});

module.exports = router