const express = require('express');
const router = express.Router();


// @route   GET api/auth
// @desc    Test route
// @access  Public
//if not public the route require authentication for access
router.get('/', (req,res)=>{
    res.send('Auth Route');
});

module.exports = router;