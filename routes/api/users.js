const express = require('express');
const router = express.Router();
const {checkSchema, validationResult} = require('express-validator');

// @route   GET api/users
// @desc    Register User
// @access  Public
//if not public the route require authentication for access
//instead of checkSchemea

// [
//     check('name').not().isEmpty().withMeassage("Name is Requires"),
//     check('email').isEmail().withMeassage('Please enter a valid email'),
//     check('password').isLength({min:6}).withMeassage('password must contain 6 or more characters')
// ]
// Ctrl K+C to comment and Ctrl K+U to uncomment the code

router.post('/',checkSchema({
    name:{
        not: true,
        isEmpty:true,
        errorMessage:"Name is Required",
    },
    email:{
        isEmail:true,
        errorMessage:"Please enter a valid mail",
    },
    password:{
        isLength:{
            errorMessage:"Minimum characters 6",
            options: {min:6},
        },
    },
}),
    (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array()})
    }
    console.log(req.body);
    res.send('User Route');
});



module.exports = router;