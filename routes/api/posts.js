const express = require('express');
const router = express.Router();
const {check,validationResult} = require('express-validator');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   POST api/posts
// @desc    Create a post
// @access  Private
//if not public the route require authentication for access
router.post('/',[
    auth,
    [
        check('text', 'Text is required').not().isEmpty()
    ]
    ], 
    async (req,res)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() })
        }
        
        try {
            const user = await User.findById(req.user.id).select('-password');

            const newPost = new Post({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            });

            const post = await newPost.save();
            res.json(post);
        } catch (err) {
            console.error(err.message)
            res.status(500).send('Server Error')
        }
    }
);

// @route   GET api/posts
// @desc    Get all posts
// @access  Private
//if not public the route require authentication for access

router.get('/', auth, async (req,res)=>{
    try{
        const posts = await Post.find().sort({ date : -1 })
        // -1 will give recent ones
        res.json({posts});
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

// @route   GET api/posts/:id
// @desc    Get post by id
// @access  Private
//if not public the route require authentication for access

router.get('/:id', auth, async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({ msg: 'Post Not Found'});
        }
        res.json(post);
    } catch (err) {
        console.error(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(404).json({ msg: 'Post Not Found'});
        }
        res.status(500).send('Server Error');
    }
});


// @route   DELETE /api/posts/:id
// @desc    Delete Post by Id
// @access  Private
//if not public the route require authentication for access

router.delete('/:id', auth, async (req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({ msg: 'Post Not Found'});
        }
        // Check if the user who created the post is the one deleting the post
        if(post.user.toString() !== req.user.id){
            return res.status(401).json({ msg: 'User not authorized' });
        }
        await post.remove();

        res.json({ msg: 'Post Removed'});
    }catch(err){
        console.error(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(404).json({ msg: 'Post Not Found'});
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/posts/like/:id
// @desc    Like a post
// @access  Private

router.put('/like/:id', auth, async (req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
        
        //Check if the post has already been liked
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
            return res.status(400).json({ msg: 'Post already liked' });
        }
        post.likes.unshift({user:req.user.id});
        await post.save();
        res.json(post.likes);
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});

// @route   PUT /api/posts/unlike/:id
// @desc    Unlike a post
// @access  Private


router.put('/unlike/:id', auth, async (req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        
        //Check if the post has already been liked
        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
            return res.status(400).json({ msg: 'Post has not yet been liked' });
        }
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
        post.likes.splice(removeIndex);
        await post.save();
        res.json(post.likes);
        
    }catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});

// @route   POST api/posts/comments/:id
// @desc    Comment on a post
// @access  Private
//if not public the route require authentication for access
router.post('/comments/:id',[
    auth,
    [
        check('text', 'Text is required').not().isEmpty()
    ]
    ], 
    async (req,res)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() })
        }
        
        try {
            const user = await User.findById(req.user.id).select('-password');
            const post = await Post.findById(req.params.id);

            const newComment = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            };

            post.comments.unshift(newComment);

            await post.save();
            res.json(post);
        } catch (err) {
            console.error(err.message)
            res.status(500).send('Server Error')
        }
    }
);

// @route   DELETE api/posts/comments/:id/:comment_id
// @desc    Delete a comment
// @access  Private
router.delete('/comment/:id/:comment_id', auth, async (req,res)=>{
    try {
        const post = await Post.findById(req.params.id);

        //Pull the comment
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);

        // Make sure the comment exits
        if(!comment){
            return res.status(404).json({ msg: 'Comment does not exist'});
        }

        if(comment.user.toString() !== req.user.id){
            return res.status(401).json({ msg : 'User not authorized'});
        }

        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);

        post.comments.splice(removeIndex, 1);

        await post.save()
        res.json(post.comments)

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});

module.exports = router;