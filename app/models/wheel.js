const mongoose = require("mongoose");

const TopWins = mongoose.model(
  "TopWins",
  new mongoose.Schema({
    game: { type: String, default: "" },
    userdata: { type: String, default: "" },
    alldata: { type: String, default: "" },
    username: { type: String, default: "" },
    x: { type: Number, default: 0 },
    win: { type: Number, default: 0},
    

    date: { type: Date, default: Date.now },
    
  })
);

module.exports = TopWins;
