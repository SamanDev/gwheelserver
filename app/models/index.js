const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.Wheel = require("./wheel");
db.userWheel = require("./user");

module.exports = db;
