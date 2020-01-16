const express = require('express');

const {ensureAuthenticated} = require('../middleware/ensureAuthenticated');

const router = express.Router();

router.get('/', ensureAuthenticated, (req,res)=>{
    res.json({message:'Hi there.', userData: req.user});
})

module.exports = router