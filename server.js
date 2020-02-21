const express = require('express');
const cors = require('cors');

const connnectDb = require('./config/db');

const app = express();

app.use(cors());

//Init Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//connect to database
connnectDb();

//Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

const port = process.env.port || 5000;

app.listen(port, console.log(`listening on port :${port}`));
