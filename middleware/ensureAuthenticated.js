const jwt = require('jsonwebtoken');
const Key = require('../config/keys');
module.exports = {
    // ensure whether the user logged in or not
    ensureAuthenticated: async function (req, res, next) {
      const token = req.header('x-auth-token');
      if (!token) 
        return res.json({success:false, message:'Access denied. Make sure that you login first to grant access.'});
      try {
        const decoded = jwt.verify(token, Key.jsonWebTokenKey);
        req.user = decoded;
        next();
      }
      catch (ex) {
        res.status(400).json({ success: false, message: 'Invalid token.' });
      }
    },
  
    // ensure if user recently logged in and attempts to relogin
    forwardAuthenticated: function (req, res, next) {
      const token = req.header('x-auth-token');
      if (!token) {
        return next();
      }
      return res.json({ success: false, message: 'You already logged in.' });
    },
}  