const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
  //Get the token
  const token = req.header('x-auth-token');

  //check if no token
  if (!token)
    return res.status(401).json({ msg: 'no token, Authorization Denied' });

  //verify token
  try {
    req.user = jwt.verify(token, config.get('jwtSecret')).user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'token is not valid' });
  }
};
