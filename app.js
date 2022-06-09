require('dotenv').config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const moment = require("moment");

const app = express();
app.use(cors());
const server = http.createServer(app);

const chatBot = "Chat Bot"

const connectedUsers = {};
const getCurrentTime = () => {
  return moment().format("LT");
}

const io = new Server(server, {
  cors: {
    origin: ["https://norp-chart.netlify.app"]
  }
})

io.on('connection', (socket) => {

  socket.on("join_room", (data) => {
    socket.join(data.room)
    if(!connectedUsers[`${socket.id}`]) {
      connectedUsers[`${socket.id}`] = {username: data.username}

      io.emit("users_connected", {...connectedUsers})
    }

    socket.emit("welcome_message", {username: chatBot, message: `Hi ${data.username}, welcome to ${data.room} chat room`, room: data.room, time: data.time})

    socket.to(data.room).emit("user_joined_message", {username: chatBot, message: `${data.username} has joined the chat`, room: data.room, time: data.time});
  })

  socket.on("send_message", (messageData) => {
    io.to(messageData.room).emit("receive_message", messageData);
  })

  socket.on("send_private_message", (messageData) => {
    socket.to(messageData.to).emit("receive_private_message", messageData);
  })

  socket.on("disconnecting", () => {
    let socketId = socket.id;
    let message = ""
    
    if(connectedUsers[`${socketId}`]) {
      message = `${connectedUsers[`${socketId}`].username} has left`;
      delete connectedUsers[`${socket.id}`]

      let myRooms = socket.rooms.values();

      for (const s of myRooms){
        if(s != `${socket.id}`){
          io.to(s).emit("receive_message", {username: chatBot, message, room: s, time: getCurrentTime()})
        }
      }

      io.emit("users_connected", {...connectedUsers})
    }
  })

  socket.on("disconnect", () => {
    io.emit("user_disconnected", socket.id)
    console.log("User has disconnected", socket.id);
  })
})

server.listen(process.env.PORT, () => {
  console.log("Server is listening on port: " + process.env.PORT)
})