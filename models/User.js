const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

UserSchema.methods.generateAuthToken = function() {
  return jwt.sign({ user: { _id: this._id } }, config.get('jwtSecret'));
};

module.exports = User = mongoose.model('user', UserSchema);
