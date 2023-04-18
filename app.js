// require("dotenv").config();
const express = require("express");
const http = require("http");
const socket = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socket(server);

const users = {};
const socketToRoom = {};

io.on("connection", (socket) => {
  socket.on("going to join", (roomID) => {
    socket.emit("all users in room", users[roomID]);
  });

  socket.on("join room", (roomID, userName, userImage) => {
    if (users[roomID]) {
      users[roomID].push({
        id: socket.id,
        userName: userName,
        userImage: userImage,
      });
    } else {
      users[roomID] = [
        {
          id: socket.id,
          userName: userName,
          userImage: userImage,
        },
      ];
    }
    socketToRoom[socket.id] = roomID;
    console.log("All user including me:");
    console.log(users);
    // console.log("Rooms");
    // console.log(socketToRoom);
    const usersInThisRoom = users[roomID].filter(
      (user) => user.id !== socket.id
    );
    // console.log("peers");
    // console.log(usersInThisRoom);
    socket.emit("all users", usersInThisRoom);
  });

  socket.on("sending signal", (payload) => {
    io.to(payload.userToSignal).emit("user joined", {
      signal: payload.signal,
      callerID: payload.callerID,
      userImage: payload.userImage,
      userName: payload.userName,
    });
  });

  socket.on("returning signal", (payload) => {
    io.to(payload.callerID).emit("receiving returned signal", {
      signal: payload.signal,
      id: socket.id,
    });
  });

  socket.on("disconnect", () => {
    const roomID = socketToRoom[socket.id];
    let room = users[roomID];
    if (room) {
      room = room.filter((user) => user.id !== socket.id);
      users[roomID] = room;
    }
    if (users[roomID] && users[roomID].length === 0) {
      delete users[roomID];
    }
    delete socketToRoom[socket.id];
    console.log("On disconnect users:");
    console.log(users);
    ``;
    // console.log("Room after disconnect");
    // console.log(socketToRoom);
    socket.broadcast.emit("user left", socket.id);
  });

  //FOR CHAT
  socket.on("send message", (body) => {
    io.emit("message", body);
  });

  socket.on("turning back video", () => {
    socket.emit("resend video");
  });

  //FOR CHANGING BACKGROUND
  socket.on("changing background", () => {
    socket.emit("send changed background video");
  });

  //FOR SCREENSHARING
  socket.on("sending renegotiation offer", (payload) => {
    io.to(payload.target).emit("renegotiation offer", payload);
  });

  socket.on("sending renegotiation answer", (payload) => {
    io.to(payload.target).emit("renegotiation answer", payload);
  });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "./client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "./client/build/index.html"));
  });
}

const port = process.env.PORT || 8000;
server.listen(port, () =>
  console.log(`Server is up and running on port ${port}...`)
);
