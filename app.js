const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const moment = require("moment");

const app = express();
const server = http.createServer(app);

const PORT = 3001;
const chatBot = "Chat Bot"

const connectedUsers = {};
const getCurrentTime = () => {
  return moment().format("LT");
}

app.use(cors());

const io = new Server(server, {
  cors: {
    options: ["http://localhost:3000"]
  }
})

io.on('connection', (socket) => {

  socket.on("join_room", (data) => {
    socket.join(data.room)
    if(!connectedUsers[`${socket.id}`]) {
      connectedUsers[`${socket.id}`] = {username: data.username}
    }

    socket.emit("welcome_message", {username: chatBot, message: `Hi ${data.username}, welcome to ${data.room} chat room`, room: data.room, time: data.time})

    socket.to(data.room).emit("user_joined_message", {username: chatBot, message: `${data.username} has joined the chat`, room: data.room, time: data.time});
  })

  socket.on("send_message", (messageData) => {
    io.to(messageData.room).emit("receive_message", messageData);
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
    }
  })

  socket.on("disconnect", () => {
    console.log("User has disconnected")
  })
})

server.listen(PORT, () => {
  console.log("Server is listening on port: " + PORT)
})