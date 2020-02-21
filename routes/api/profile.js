const router = require('express').Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');
const request = require('request');
const config = require('config');
const Post = require('../../models/Post');

//@route    GET api/profile/me
//@desc     Get Current User's profile
//@access   Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user._id
    }).populate('user', ['name', 'avatar']);

    if (!profile)
      return res.status(400).json({ msg: 'There is no Profile for this user' });

    res.json(profile);
  } catch (err) {
    console.error(err.messsage);
    res.status(500).send('Server Error');
  }
});

//@route    POST api/profile
//@desc     create or update user's profile
//@access   Private

router.post(
  '/',
  [
    auth,
    [
      check('status', 'status is required')
        .not()
        .isEmpty(),
      check('skills', 'skills is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      //check if the profile exits
      let newProfile = false;
      let profile = await Profile.findOne({ user: req.user._id });

      if (!profile) {
        newProfile = true;
        profile = {};
        profile.user = req.user._id;
      }

      const skillsAndSocial = [
        'skills',
        'twitter',
        'facebook',
        'youtube',
        'linkedin',
        'instagram'
      ];

      for (prop in req.body) {
        if (!skillsAndSocial.includes(prop)) {
          profile[prop] = req.body[prop];
        }
      }
      const { skills } = req.body;
      profile.skills = skills.split(',').map(skill => skill.trim());

      profile.social = {};
      skillsAndSocial.forEach(prop => {
        if (prop !== 'skills') {
          profile.social[prop] = req.body[prop];
        }
      });

      //save the profile to database
      if (newProfile) {
        profile = new Profile(profile);
      }

      profile.save();
      res.send(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//@route    GET api/profile/:profile_id
//@desc     get a user's profile by id
//@access   Public

router.get('/:profile_id', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.profile_id).populate(
      'user',
      'name avatar'
    );

    if (!profile) return res.status(400).json({ msg: 'Profile not found' });

    res.send(profile);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route    GET api/profile
//@desc     get all profiles
//@access   Public

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', 'name avatar');
    if (!profiles) return res.status(400).json({ msg: 'No Profile found' });
    res.send(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route    GET api/profile/user/:user_id
//@desc     get profile by Id
//@access   Public

router.get('/', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate('user', 'name avatar');
    if (!profile) return res.status(400).json({ msg: 'No profile found' });
    res.send(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route    DELETE  api/profile
//@desc     delete profile user and posts
//@access   Private

router.delete('/', auth, async (req, res) => {
  try {
    //Remove Posts
    await Post.deleteMany({ user: req.user._id });
    //Remove Profile
    await Profile.findOneAndDelete({ user: req.user._id });
    //Remove User
    await User.findByIdAndDelete(req.user._id);
    //TODO: Remove User's post
    res.json({ msg: 'Profile Deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Errror');
  }
});

//@route    PUT  api/profile/experience
//@desc     add experience to a User's profile
//@access   Private

router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required')
        .not()
        .isEmpty(),
      check('company', 'Company is required')
        .not()
        .isEmpty(),
      check('from', 'from is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    //check for data validation
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    //create the experience object
    const experience = {};
    for (prop in req.body) {
      experience[prop] = req.body[prop];
    }

    //add the experience to user's profile
    try {
      const profile = await Profile.findOneAndUpdate(
        { user: req.user._id },
        { $push: { experience: experience } },
        { new: true }
      );
      res.send(profile);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  }
);

//@route    DELETE  api/profile/experience/:experience_id
//@desc     delete experience to a User's profile
//@access   Private

router.delete('/experience/:experience_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { experience: { _id: req.params.experience_id } } },
      { new: true }
    );

    res.send(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route    PUT  api/profile/education
//@desc     add education to a User's profile
//@access   Private

router.put(
  '/education',
  [
    auth,
    [
      check('school', 'school is required')
        .not()
        .isEmpty(),
      check('degree', 'degree is required')
        .not()
        .isEmpty(),
      check('fieldOfStudy', 'field of study is required')
        .not()
        .isEmpty(),
      check('from', 'from is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    //check for data validation
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    //create the education object
    const education = {};
    for (prop in req.body) {
      education[prop] = req.body[prop];
    }

    //add the education to user's profile
    try {
      const profile = await Profile.findOneAndUpdate(
        { user: req.user._id },
        { $push: { education } },
        { new: true }
      );
      res.send(profile);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  }
);

//@route    DELETE  api/profile/education/:education_id
//@desc     delete education to a User's profile
//@access   Private

router.delete('/education/:education_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { education: { _id: req.params.education_id } } },
      { new: true }
    );

    res.send(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route    GET api/profile/github/:username
//@desc     get user  repos from github
//@access   Public

router.get('/github/:username', async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=create:asc&cliet_id=${config.get(
        'githubClientId'
      )}&client_secret=${'githubSecret'}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' }
    };
    request(options, (error, response, body) => {
      if (error) {
        console.error(error);
      }
      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: 'No Github profile found' });
      }
      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.messsage);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
