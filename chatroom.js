const express = require("express");
const app = express();
const http = require('http').Server(app)
const io = require('socket.io')(http);

app.use(express.static("public"))
app.use(express.json())

http.listen("3002", () => {
    console.log("Chatroom server is up!")
})

io.on('connection', (socket) => {

    console.log("A user has connected!");
    io.emit('chatMessage', "<i>Someone new has connected!</i>")

    socket.on('chatMessage', (msg) => {
        console.log("Recieved message: " + msg);
        io.emit('chatMessage', msg);
    })
})

app.get("/", (req,res) => {
    res.redirect("/chat")
})

app.use("/chat", (req, res) => {
    res.sendFile(__dirname + "/public/html/chatroom.html")
})

