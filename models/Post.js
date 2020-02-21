const mongoose = require('mongoose');

const { Schema } = mongoose;

const LikeSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  }
});

const CommentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  text: {
    type: String,
    required: true
  },
  name: String,
  avatar: String,
  date: {
    type: Date,
    default: Date.now
  }
});

const PostSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  text: {
    type: String,
    required: true
  },
  name: String,
  avatar: String,
  likes: [LikeSchema],
  comments: [CommentSchema],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Post = mongoose.model('post', PostSchema);
