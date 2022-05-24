const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const PORT = 3001;
const chatBot = "Chat Bot"

app.use(cors());

const io = new Server(server, {
  cors: {
    options: ["http://localhost:3000"]
  }
})

io.on('connection', (socket) => {

  socket.on("join_room", (data) => {
    socket.join(data.room)
    socket.to(data.room).emit("user_joined_message", {username: chatBot, message: `${data.username} has joined the chat`, time: data.time});
  })

  socket.on("send_message", (messageData) => {
    io.emit("receive_message", messageData);
  })

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  })
})

server.listen(PORT, () => {
  console.log("Server is listening on port: " + PORT)
})