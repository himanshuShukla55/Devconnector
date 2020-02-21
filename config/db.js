const config = require('config');
const mongoose = require('mongoose');

const db = config.get('mongoURI');

const connectDb = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    console.log('connected to database');
  } catch (error) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDb;
