const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

// @route   GET api/auth
// @desc    Test route
// @access  Public
//if not public the route require authentication for access
router.get('/', auth,(req,res)=>{
    res.send('Auth Route');
});
// By adding auth to this route it will make this 
// route protected
module.exports = router;