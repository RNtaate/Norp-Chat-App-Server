const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const PORT = 3001;

app.use(cors());

const io = new Server(server, {
  cors: {
    options: ["http://localhost:3000"]
  }
})

io.on('connection', (socket) => {
  console.log("User has made a connection with the socket server");
})

server.listen(PORT, () => {
  console.log("Server is listening on port: " + PORT)
})