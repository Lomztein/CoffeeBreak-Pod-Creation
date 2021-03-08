const express = require("express");
const app = express();
const http = require('http').Server(app)
const io = require('socket.io')(http);

let url = undefined;

app.use((req, res, next) => {
    url = req.protocol + "://" + req.get('host') + req.originalUrl;
    let test = req.get('host');
    console.log(url);
    console.log(test);
    next()
})

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

app.use("/", (req, res) => {
    res.sendFile(__dirname + "/public/html/chatroom.html")
})