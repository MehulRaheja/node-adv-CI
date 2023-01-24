jest.setTimeout(60000); // timeout for each test will be 30 second, by default it is 5 second

require('../models/User');

const mongoose = require('mongoose');
const keys = require('../config/keys');

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, { useMongoClient: true });