const express = require("express");
const cors = require("cors");
const app = express();
const axios = require("axios").create({ baseUrl: "http://127.0.0.1:8081" });
var corsOptions = {
  origin: ["https://gwheelui.pages.dev", "http://localhost:3000"],
};
const serverPort = process.env.NODE_ENV === "production" ? 2083 : 8085;
const soocketPort = process.env.NODE_ENV === "production" ? 2087 : 2424;
app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

const db = require("./app/models");

const User = db.user;
const Wheel = db.Wheel;

function groupBySingleField(data, field) {
  return data.reduce((acc, val) => {
    const rest = Object.keys(val).reduce((newObj, key) => {
      if (key !== field) {
        newObj[key] = val[key];
      }
      return newObj;
    }, {});
    if (acc[val[field]]) {
      acc[val[field]].push(rest);
    } else {
      acc[val[field]] = [rest];
    }
    return acc;
  }, {});
}
db.mongoose
  .connect(`mongodb+srv://salar:42101365@wheel.1pavbxp.mongodb.net/GWheelNew`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

const getUserService = (token) => {
  return axios({
    url: "http://127.0.0.1:8081/api/req/gamesGetUser",
    method: "get",
    headers: {
      Authorization: token ? `LooLe  ${token}` : null,
    },
  })
    .then((response) => {
      return response.data;
    })
    .catch((err) => {
      return err;
    });
};
const getChipService = (com, data) => {
  console.log(data);
  return axios({
    url: "http://127.0.0.1:8081/api/req/nodeService/" + com,
    method: "post",

    data,
  })
    .then((response) => {
      return response.data;
    })
    .catch((err) => {
      return err;
    });
};
var userswinLisr = "";
app.get("/lastlist", async (req, res) => {
  if (req.query.l == "users") {
    res.json(wheelusers);
  } else if (req.query.l == "leaders") {
    if (userswinLisr == "") {
      const userswin = await User.find(
        {},
        { username: 1, image: 1, balance2: 1 }
      )

        .limit(10)
        .sort({ balance2: -1 });
      userswinLisr = userswin;
    }

    res.json(userswinLisr);
  } else if (req.query.l == "wheelid") {
    const userswin = await Wheel.findById(req.query.id).populate("wheelusers");
    res.json(userswin);
  } else {
    var sortig = { date: -1, total: -1 };
    if (req.query.l != "myList") {
      if (req.query.l == "winList") {
        sortig = { net: -1 };
      }
      var users2 = await Wheel.find({ status: "Done" }).limit(10).sort(sortig);
    } else {
      var udata = [];
      const userswin = await db.userWheel
        .find({ username: req.query.u }, { pid: 1 })
        .limit(10)
        .sort({ win: -1 });

      var userlist = groupBySingleField(userswin, "pid");

      Object.keys(userlist).forEach((key) => {
        udata.push({ _id: key });
      });

      var users2 = await Wheel.find({ $or: udata }).sort({ net: -1 });
    }
    res.json(users2);
  }
});
function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

const segments = [
  0, 2, 4, 2, 10, 2, 4, 2, 8, 2, 4, 2, 25, 2, 4, 2, 8, 2, 4, 2, 10, 2, 4, 2, 8,
  2, 4, 2, 20,
];
const d = new Date();
var wheel = {
  status: "Done",
  startNum: 0,
  wheelusers: [],
  number: 0,
  total: 0,
  net: 0,
  avex: 0,
  aveBetx: 0,
  serverCode: Math.floor(Math.random() * 9999),
  serverSec: 0,
  date: d,
};
var wheelusers = [];

const createWheel = function (startNum) {
  const d = new Date();
  let seconds = d.getSeconds();
  return Wheel.create({
    status: "Pending",
    number: 0,
    total: 0,
    net: 0,
    avex: 0,
    aveBetx: 0,
    serverCode: Math.floor(Math.random() * 9999),
    serverSec: seconds,
    startNum: startNum,
    wheelusers: [],
    date: d,
  }).then((wheel) => {
    return wheel;
  });
};

const { Server } = require("socket.io");
const io = new Server(soocketPort, {
  cors: { corsOptions },
});
const wheelNamespace = io.of("/wheel");

wheelNamespace.on("disconnect", (reason) => {
  if (reason === "io server disconnect") {
    // the disconnection was initiated by the server, you need to reconnect manually
    //wheelNamespace.connect();
  }
  console.log(reason); // else the socket will automatically try to reconnect
});
wheelNamespace.use(async (socket, next) => {
  const user = socket.handshake.auth.username;
  const token = socket.handshake.auth.token;

  if (socket.user != user) {
    // const userdata = await getUserService("Command=AccountsGet&Player=" + user);
    const userdata = await getUserService(token);

    if (userdata?.username == user) {
      wheelNamespace.in(user).disconnectSockets(true);

      socket.join(user);
      let getuser = {
        username: userdata.username,
        balance: userdata.balance,
        balance2: userdata.balance2,
        image: userdata.level,
      };
      socket.userdata = getuser;
      socket.user = userdata.username;
      next();
    } else {
      next();
    }
  } else {
    next();
  }
});

wheelNamespace.on("connection", (socket) => {
  socket.on("addchat", (data) => {
    socket.broadcast.emit("msg", { command: "chat", data: data });
  });
  socket.on("addBet", async (data) => {
    if (socket.userdata.username) {
      if (wheel.status == "Pending") {
        data.win = -1;
        data.username = socket.userdata.username;
        data.image = socket.userdata.image;
        data.id = socket.userdata._id;
        wheel.total = wheel.total + data.bet;

        let fu = wheelusers.filter(
          (user) =>
            user.username == data.username && user.position == data.position
        );
        if (fu.length > 0) {
          const newProjects = wheelusers.map((user) =>
            user.username == data.username && user.position == data.position
              ? { ...user, bet: user.bet + data.bet }
              : user
          );

          wheelusers = newProjects;
        } else {
          wheelusers.push(data);
        }
        await User.findOneAndUpdate(
          { _id: socket.userdata._id, balance2: { $gt: data.bet - 1 } },
          { $inc: { balance2: data.bet * -1 } }
        ).then((res) => {
          if (res?.username) {
            var _d = res;
            _d.balance2 = _d.balance2 - data.bet;
            socket.broadcast.emit("msg", { command: "bets", data: data });
          }
        });

        // wheelNamespace.emit("msg", { command: "bets", data: data });
      }
    }
  });
  socket.emit("msg", { command: "users", data: wheelusers });
  wheelNamespace.emit("msg", {
    command: "online",
    data: wheelNamespace.sockets.size,
  });
  socket.emit("msg", { command: "setuser", data: socket.userdata });

  socket.emit("msg", {
    command: "update",
    data: wheel,
  });

  // getLast(socket);
});
const initial = async () => {
  console.log("initial");

  var defwheel = null;
  try {
    defwheel = await Wheel.findOne().sort({ date: -1 });
  } catch (error) {
    //createWheelData();
  }

  if (defwheel == null || defwheel?.status == "Done") {
    createWheelData();
  } else if (defwheel?.status == "Pending") {
    wheel = defwheel;

    spin();
  } else if (defwheel?.status == "Spin") {
    setTimeout(() => {
      spinstop();
    }, 3000);
  } else if (defwheel?.status == "Spining") {
    setTimeout(() => {
      doneWheel();
    }, 3000);
  }
};
const createWheelData = async () => {
  var wheeldb = await createWheel(wheel?.number);

  wheel = wheeldb;
  wheelNamespace.emit("msg", {
    command: "update",
    data: wheel,
  });
  wheelusers = [];
  wheelNamespace.emit("msg", { command: "resetusers" });

  setTimeout(() => {
    spin();
  }, 15000);
};
const spin = async () => {
  const d = new Date();
  let seconds = (wheel?.serverSec + 30) % 60;

  wheel.serverSec = seconds;
  let newPrizeNumbern = getPrizePos(wheel);
  wheel.number = newPrizeNumbern;

  wheel.status = "Spin";
  wheelNamespace.emit("msg", {
    command: "update",
    data: wheel,
  });
  var dd = await Wheel.findByIdAndUpdate(wheel._id, {
    status: "Spin",
    serverSec: seconds,
    number: newPrizeNumbern,
  });

  setTimeout(() => {
    spinstop();
  }, 25000);
};
const spinstop = async () => {
  var _time = 5000;
  wheel.status = "Spining";
  var _tot = 0;
  var _net = 0;
  if (wheelusers.length > 0) {
    wheelusers.forEach((item) => {
      item.win = item.bet * getPrize(segments[wheel.number], item.position);
      _tot = _tot + item.bet;
      _net = _net + item.win;
    });
  }

  wheel.total = _tot;
  wheel.net = _net;
  wheelNamespace.emit("msg", {
    command: "update",
    data: wheel,
  });
  wheelNamespace.emit("msg", { command: "users", data: wheelusers });
  if (wheelusers.length > 0) {
    // _time = 3000;
    inc();
  }
  var dd = await Wheel.findByIdAndUpdate(wheel._id, {
    status: "Spining",
    total: _tot,
    net: _net,
  });

  setTimeout(() => {
    doneWheel();
  }, _time);
};
const doneWheel = async () => {
  userswinLisr = "";
  var _time = 3000;
  wheel.status = "Done";
  wheelNamespace.emit("msg", {
    command: "update",
    data: wheel,
  });
  var dd = await Wheel.findByIdAndUpdate(wheel._id, { status: "Done" });
  if (wheelusers.length > 0) {
    // _time = 3000;

    wheelusers.forEach(async (item) => {
      item.pid = wheel._id;
      var user = await createUser(wheel._id, item);
    });
    setTimeout(() => {
      createWheelData();
    }, _time);
  } else {
    setTimeout(() => {
      createWheelData();
    }, _time);
  }
};
const getPrize = (newPrizeNumber, pos) => {
  var num = 0;
  if (parseInt(newPrizeNumber) == parseInt(pos)) {
    num = parseInt(pos);
  }

  return num;
};

const getPrizePos = (users) => {
  var newPrizeNumber = users?.serverCode * users?.startNum;

  newPrizeNumber = newPrizeNumber + users?.serverCode * users?.serverSec;
  newPrizeNumber = newPrizeNumber % segments.length;

  return newPrizeNumber;
};

const sumOfBet = (array) => {
  return array.reduce((sum, currentValue) => {
    var _am = currentValue.bet;
    return sum + _am;
  }, 0);
};
const sumOfWin = (array) => {
  return array.reduce((sum, currentValue) => {
    var _am = currentValue.win;
    return sum + _am;
  }, 0);
};
const dec = async () => {
  var newData = groupBySingleField(wheelusers, "username");
  var uddata = [];
  for (const property in newData) {
    uddata.push({
      bet: sumOfBet(newData[property]),
      username: property,
    });
  }
  var sendddata = { gameName: "Slot", data: uddata };
  const userdata = await getChipService("gamesStartGame", sendddata);

  //wheelNamespace.emit("msg", { command: "update", data: wheel });
};
const inc = () => {
  var newData = groupBySingleField(wheelusers, "username");
  var uddata = [];
  for (const property in newData) {
    if (sumOfWin(newData[property]) > 0) {
      uddata.push({
        bet: sumOfWin(newData[property]),
        username: property,
      });
    }
  }
  var sendddata = { gameName: "Slot", data: uddata };

  const userdata = getChipService("gamesEndGame", sendddata);
};

const createUser = function (wheelId, comment) {
  return db.userWheel.create(comment).then((docComment) => {
    return db.Wheel.findByIdAndUpdate(
      wheelId,
      { $push: { wheelusers: docComment._id } },
      { new: true, useFindAndModify: false }
    );
  });
};
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app, wheel);

app.listen(serverPort, () => {
  console.log(`Server is running on port ${serverPort}.`);
  initial();
});
