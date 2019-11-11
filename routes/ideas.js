const express=require('express');
const mongoose=require('mongoose');
const router=express.Router();

//Load helper
const {ensureAuthenticated}=require('../helpers/auth');
//Model export for MongDB
require('../models/Ideas');
const Ideas = mongoose.model('ideas');

router.get('/',ensureAuthenticated, (req, res) => {
    Ideas.find({user:req.user.id})
        .sort({
            date: 'desc'
        })
        .then((ideas) => {
            res.render('ideas/index', {
                ideas: ideas
            });
        }).catch((err) => {
            console.log(err)
        });
});
router.get('/add',ensureAuthenticated, (req, res) => {
    res.render('ideas/add')
});

router.get('/edit/:id',ensureAuthenticated, (req, res) => {
    Ideas.findOne({
            _id: req.params.id,
        })
        .then((ideas) => {
            if(ideas.user!=req.user.id){
             req.flash('error_msg','Not Authorized Person')
             res.redirect('/ideas');
            }else{
            res.render('ideas/edit', {
                ideas: ideas
            })
        }
        }).catch((err) => {
            console.log(err);
        });
});

router.post('/',ensureAuthenticated, (req, res) => {
    const {
        title,
        details
    } = req.body;
    let errors = []
    if (!title) {
        errors.push({
            text: 'Please add a title to your idea 😇'
        });
    }
    if (!details) {
        errors.push({
            text: "Please add some details to you Idea 😅"
        });
    }
    if (errors.length > 0) {
        res.render('ideas/add', {
            errors: errors,
            title: title,
            details: details
        });
    } else {
        const newUser = {
            title: title,
            details: details,
            user:req.user.id
        }
        new Ideas(newUser)
            .save()
            .then((ideas) => {
                req.flash('success_msg','Idea Added Successfully');
                res.redirect('/ideas');
            }).catch(err => console.log(err));
    }
});

router.put('/:id',ensureAuthenticated, (req, res) => {
        Ideas.findOne({
                _id: req.params.id
            })
            .then((ideas) => {
                ideas.title = req.body.title;
                ideas.details = req.body.details;
                ideas.save()
                    .then((idea) => {
                        req.flash('success_msg','Idea Edited Successfully');
                        res.redirect('/ideas');
                    }).catch(err => console.log(err))
            }).catch((err) => {
                console.log(err)

            });
});

router.delete('/:id',ensureAuthenticated, (req, res) => {
    Ideas.deleteOne({
            _id: req.params.id
        })
        .then(() => {
            req.flash('success_msg','Idea Removed Successfully');
            res.redirect('/ideas')
        }).catch((err) => {
            console.log(err);
        });
});


module.exports=router