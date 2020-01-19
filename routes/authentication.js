const express = require('express');
const crypto = require('crypto');
const async = require('async');
const nodemailer = require('nodemailer');

const User = require('../models/User');
const {forwardAuthenticated} = require('../middleware/ensureAuthenticated');

const router = express.Router();

/* 
  POST Sign-up
  @Route: /auth/signup
*/
router.post('/signup', async (req,res)=>{
    try{

        /*
        Validation to be set here.
        */
       
       const {email, password} = req.body;
       
       let user = await User.findOne({email});
       if(user)
       return res.json({success:false, message: 'Email address already exist.'});
       
        user = new User({ email, password});
        
        await user.save();
        res.json({success:true, message: 'Successfully Registered'});
    }catch(err){
        return res.json({success:false, message: err.message});
    }
})
/* 
  POST Login
  @Route: /auth/login
*/
router.post('/login', forwardAuthenticated, async (req, res, next) => {
    const { email, password } = req.body;
  
    const user = await User.findOne({email})
  
    if (!user)
      return res.json({success: false,message: 'Invalid email or password'});
  
    user.comparePassword(password, (err, isMatch) => {
      if (isMatch) {
        const token = user.generateAuthToken();
        return res.header('x-auth-token', token).json({success: true,message: 'Successfully Logged-In'});
      } else {
        return res.json({ success: false, message: 'Invalid Password' });
      }
    });
  });
  
/* 
  POST Forgot Password Request
  @Route: /auth/forgot
*/
router.post('/forgot', forwardAuthenticated, async (req, res, next) => {
    try {
      async.waterfall(
        [
          function(done) {
            crypto.randomBytes(20, function(err, buf) {
              var token = buf.toString('hex');
              done(err, token);
            });
          },
          function(token, done) {
            if(req.body.email == '' || req.body.email == null || req.body.email == undefined)
            return res.json({success: false,message: 'email is required'});
  
            User.findOne({ email: req.body.email }, function(err, user) {
              if (!user) {
                return res.json({success: false,message: 'email address doesn`t exist'});
              }
  
              user.resetPasswordToken = token;
              user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
              user.save(function(err) {
                done(err, token, user);
              });
            });
          },
          function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
              service: 'Gmail',
              auth: {
                user: 'GMAIL',
                pass: 'GMAIL Passowrd'
              }
            });
            var mailOptions = {
              from: keys.GmailAccount,
              to: user.email,
              subject: 'Password Reset',
              text:
                'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://example.com' +
                token +
                '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
              res.json({success: true,message:'An email has been sent to ' +user.email +' for further instructions'});
              done(err, 'done');
            });
          }
        ],
        function(err) {
          if (err) return next(err);
          res.redirect('/forgot');
        }
      );
    } catch (err) {
      console.log({ success: false, message: err });
      res.json({ success: false, message: err });
    }
  });
  
  /* 
    POST Reset Password
    @Route: /auth/reset/{token}
    -Token can be claimed through a forgot password Request
    -Token can be found in the user email
  */
  router.post('/reset/:token', function(req, res) {
    async.waterfall(
      [
        function(done) {
          User.findOne({resetPasswordToken: req.params.token,resetPasswordExpires: { $gt: Date.now() }},
            function(err, user) {
              if (!user) {
                return res.json({
                  success: false,
                  message: 'Invalid or expired token'
                });
              }
  
              user.password = req.body.password;
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;
  
              user.save(function(err) {
                if (err) return res.json({ success: false, message: err });
                res.json({ success: true, message: 'password has been reset successfully' })
                done(err, user);
              });
            }
          );
        },
        function(user, done) {
          var smtpTransport = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
              user: 'Gmail',
              pass: 'Gmail Password'
            }
          });
          var mailOptions = {
            from: keys.GmailAccount,
            to: user.email,
            subject: 'Your password has been changed',
            text:
              'Hello,\n\n' +
              'This is a confirmation that the password for your account ' +
              user.email +
              ' has just been changed.\n'
          };
          smtpTransport.sendMail(mailOptions, function(err) {
            res.json({
              success: true,
              message: 'Success! Your password has been changed'
            });
            done(err);
          });
        }
      ],
      function(err) {
        //res.redirect('/');
      }
    );
  });
module.exports = router;