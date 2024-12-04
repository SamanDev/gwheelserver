const express = require("express");
const cors = require("cors");
const app = express();
const axios= require("axios").create({ baseUrl: "http://127.0.0.1:8081" });
const axios3 = require("axios").create({ baseUrl: "https://api.glxypkr.com" });
var corsOptions = {
  origin: ["https://gwheelui.pages.dev", "http://localhost:3000"],
};
const serverPort = process.env.NODE_ENV === "production" ? 2083 : 2525;
app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

const db = require("./app/models");

const TopWins = db.TopWins;

const serverDB=
  process.env.NODE_ENV === "production"
    ? "mongodb+srv://208shaghayegh:3c9bEiO5kVSzfAeE@wheel.d4e9q.mongodb.net/"
    : "mongodb+srv://208shaghayegh:3c9bEiO5kVSzfAeE@wheel.d4e9q.mongodb.net/";
const serverDB3 =
  process.env.NODE_ENV === "production"
    ? "mongodb://localhost:27017/GalaxyWheel"
    : "mongodb://localhost:27017/GalaxyWheel";
db.mongoose
  .connect(serverDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
  })
  .catch((err) => {
    console.error("Connection error", err);
    //process.exit();
  });

app.get("/lastlist", async (req, res) => {
  
      const userswin = await TopWins.find(
        {},
      )

        .limit(10)
      
    res.json(userswin);
  
  
});

app.post("/add", async (req, res) => {
  
  const bet = new TopWins({
    game: req.body.game,
    userdata: JSON.stringify(req.body.userdata),
    alldata: JSON.stringify(req.body.alldata),

  });
  const myres = await bet.save();

  return res.status(200).json(myres);
});
const initial = async () => {
  console.log("initial");
  

};

app.listen(serverPort, () => {
  console.log(`Server is running on port ${serverPort}.`);
  initial();
});
