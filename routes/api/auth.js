const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const config =  require('config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {checkSchema, validationResult} = require('express-validator');

const User = require('../../models/User');

// @route   GET api/auth
// @desc    Test route
// @access  Public
//if not public the route require authentication for access
router.get('/', auth,async (req,res)=>{
    try{
        const user = await User.findById(req.user.id).select('-password');
        // leave of the password
        res.json(user);
    }catch(err){
        console.error(err.message);
        res.status(500).send("Server error")
    }
});
// By adding auth to this route it will make this 
// route protected

// @route   POST api/auth
// @desc    Authenticate user and get token
// @access  Public
//if not public the route require authentication for access
//instead of checkSchemea

router.post('/',checkSchema({
    email:{
        isEmail:true,
        errorMessage:"Please enter a valid mail",
    },
    password:{
        exists:true,
        errorMessage:"Password is required",
    },
    }),
    async (req,res)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array()})
        }

        const  {email, password} = req.body;

        try{
        // See if user does not exists
            let user = await User.findOne({email});

            if(!user){
                return res.status(400).json({errors:[{msg:'Invalid Credentials'}]});
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if(!isMatch){
                return res
                    .status(400)
                    .json({errors: [{
                        msg:"Invlaid Credentials"
                    }]
                    });
            }

            // Return Web Json TOKEN
            const payload = {
                user:{
                    id: user.id
                }
            }

            jwt.sign(
                payload,
                config.get('jwtSecret'),
                {expiresIn: 3600000}, (err, token)=>{
                    if(err) throw err;
                    res.json({token})
                }
            );
        }catch(err){
            console.error(err.message);
            res.status(500).send('Server error');
        }
});
module.exports = router;