const router = require('express').Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

//@route    GET api/auth
//@desc     test route
//@access   Public
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

//@route    POST api/auth
//@desc     Login a user
//@access   Public

router.post(
  '/',
  [
    check('email', 'email is required').isEmail(),
    check(
      'password',
      'length of password must be minimum 6 characters'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    //check if a user with the credentials exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ errors: [{ msg: 'Invalid Credentials' }] });
    }

    //check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });

    res.json({ token: user.generateAuthToken() });
  }
);

module.exports = router;
