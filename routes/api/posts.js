const router = require('express').Router();
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const Profile = require('../../models/Profile');

//@route    POST api/posts
//@desc     Create a post
//@access   Private

router.post(
  '/',
  [
    auth,
    [
      check('text', 'Text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    //validate the req
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      //get the user
      const user = await User.findById(req.user._id).select('-password');
      //create the post object
      let post = {
        user: user._id,
        name: user.name,
        avatar: user.avatar,
        text: req.body.text
      };
      //save the post object
      post = new Post(post);
      await post.save();
      res.send(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//@route    GET api/posts
//@desc     get all posts
//@access   Private

router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find();
    if (!posts) return res.status(400).json({ msg: 'No posts found' });

    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route    GET api/posts/:post_id
//@desc     get a post by Id
//@access   Private

router.get('/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    if (!post) {
      return res.status(400).json({ msg: 'No Post found' });
    }
    res.json(post);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'No Post found' });
    }
    console.error(err.message);
    res.status(500).send('Server Eroor');
  }
});

//@route    Delete api/posts/:post_id
//@desc     Delete a post
//@access   Private

router.delete('/:post_id', auth, async (req, res) => {
  try {
    //find the post
    const post = await Post.findById(req.params.post_id);
    //validate the user
    if (post.user.toString() !== req.user._id) {
      return res.status(401).json({ msg: 'User is not authorized' });
    }
    //delete the post
    await post.remove();
    res.json({ msg: 'post deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route    PUT api/posts/like/:post_id
//@desc     Like a post
//@access   Private

router.put('/like/:post_id', auth, async (req, res) => {
  try {
    //check if the post has alredy been liked by the user
    const post = await Post.findById(req.params.post_id);
    const likedBy = post.likes.map(like => like.user.toString());
    if (likedBy.includes(req.user._id)) {
      return res.status(404).json({ msg: 'user has alredy liked' });
    }
    //create the like object
    const like = { user: req.user._id };
    //save th like
    post.likes.push(like);
    post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route    PUT api/posts/unlike/:post_id
//@desc     Unlike a post
//@access   Private

router.put('/unlike/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    //check if the user has liked the post
    const removeIndex = post.likes
      .map(like => like.user.toString())
      .indexOf(req.user._id);
    if (removeIndex === -1)
      return res
        .status(400)
        .json({ msg: 'the post has no likes from the user' });
    post.likes.splice(removeIndex, 1);
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route    PUT api/posts/comment/:post_id
//@desc     add a comment to a post
//@access   Private

router.put(
  '/comments/:post_id',
  [
    auth,
    [
      check('text', 'text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    //check for request validation
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      //find the user
      const user = await User.findById(req.user._id).select('-password');
      //find the post
      const post = await Post.findById(req.params.post_id);
      //create the comment
      const comment = {
        user: user._id,
        text: req.body.text,
        name: user.name,
        avatar: user.avatar
      };
      //add it to the post
      post.comments.unshift(comment);
      await post.save();
      res.send(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//@route    Delete api/posts/comments/:post_id/:comment_id
//@desc     delete a comment from the post
//@access   Private

router.delete('/comments/:post_id/:comment_id', auth, async (req, res) => {
  try {
    //find the post
    const post = await Post.findById(req.params.post_id);
    //find the comment
    const comment = post.comments.find(
      comment => comment.id === req.params.comment_id
    );

    if (!comment) return res.status(400).json({ msg: 'No comment found' });
    //validate the user
    if (
      comment.user.toString() !== req.user._id &&
      post.user.toString() !== req.user._id
    )
      return res.status(401).json({ msg: 'user is not authorized' });
    //delete the comment
    const removeIndex = post.comments
      .map(comment => comment._id)
      .indexOf(req.params.comment_id);

    post.comments.splice(removeIndex, 1);
    await post.save();
    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
