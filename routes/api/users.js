const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config =  require('config');
const {checkSchema, validationResult} = require('express-validator');

const User = require('../../models/User');

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
    async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array()})
    }

    const {name, email, password} = req.body;

    try{
    // See if user exists
        let user = await User.findOne({email});

        if(user){
            return res.status(400).json({errors:[{msg:'User already exists'}]});
        }
    // Get Users gravatar

        const avatar = gravatar.url(email, {
            s:'200',// default size
            r: 'pg',// rating of the to avoid explicit images
            d:'mm'// default image 
        });

        //

        user = new User({
            name,
            email,
            avatar,
            password
        });
        // Encrypt password

        const salt = await bcrypt.genSalt(10);
        //salt is used for salting before hashing
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Return Web Json TOKEN
        const payload = {
            user:{
                id: user.id
            }
        }

        jwt.sign(
            payload,
            config.get('jwtSecret'),
            {expiresIn: 3600}, (err, token)=>{
                if(err) throw err;
                res.json({token})
            }
        );
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server erros');
    }
});



module.exports = router;