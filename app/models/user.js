const mongoose = require("mongoose");

const UserWheel = mongoose.model(
  "userWheel",
  new mongoose.Schema({
    username: { type: String },
    pid: { type: String },
    wheel: { type: String },
    image: { type: String },

    position: { type: Number, default: 0 },
    bet: { type: Number, default: 0 },
    win: { type: Number, default: -1 },
  })
);

module.exports = UserWheel;
