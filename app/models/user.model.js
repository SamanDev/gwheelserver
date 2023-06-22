const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    email: String,
    image: String,
    balance: { type: Number, default: 0 },
    balance2: { type: Number, default: 1000 },
    password: String,
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
      },
    ],
    tokens: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Token",
      },
    ],
  })
);

module.exports = User;
