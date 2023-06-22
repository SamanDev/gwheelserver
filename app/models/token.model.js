const mongoose = require("mongoose");

const Role = mongoose.model(
  "Token",
  new mongoose.Schema({
    name: String,
    uid: String,
    rid: String,
  })
);

module.exports = Role;
