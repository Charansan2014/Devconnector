const express = require('express');
const router = express.Router();


// @route   GET api/profiles
// @desc    Test route
// @access  Public
//if not public the route require authentication for access
router.get('/', (req,res)=>{
    res.send('Profile Route');
});

module.exports = router;