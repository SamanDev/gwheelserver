const mongoose = require("mongoose");

const TopWins = mongoose.model(
  "TopWins",
  new mongoose.Schema({
    game: { type: String, default: "" },
    userdata: { type: String, default: "" },
    alldata: { type: String, default: "" },
    

    date: { type: Date, default: Date.now },
    
  })
);

module.exports = TopWins;
