const express = require('express');
const router = express.Router();


// @route   GET api/posts
// @desc    Test route
// @access  Public
//if not public the route require authentication for access
router.get('/', (req,res)=>{
    res.send('Posts Route');
});

module.exports = router;