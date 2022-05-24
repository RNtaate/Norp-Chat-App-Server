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

  let joinMessage = `${chatBot}: User with id: ${socket.id} has joined the chat`;
  socket.broadcast.emit("user_joined", joinMessage)

  socket.on("send_message", (message) => {
    io.emit("receive_message", message);
  })

  socket.on("disconnect", () => {
    io.emit("user_joined", `User with id: ${socket.id} has left the chat`)
  })
})

server.listen(PORT, () => {
  console.log("Server is listening on port: " + PORT)
})