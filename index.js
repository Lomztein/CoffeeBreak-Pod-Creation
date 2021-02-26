const express = require("express")
const app = express()

app.use(express.static("public"))

app.get("/", (req,res) => {
    res.redirect("/index")
})

app.use("/index", (req, res) => {
    res.sendFile(__dirname + "/public/html/index.html")
})

app.post("/deletepod", (req,res) => {
    console.log("deletes pod")
    res.send("pod deleted!")
})

app.post("/createpod", (req, res) => {
    console.log("creates pod")
    res.send("pod created")
})

app.get("/test", (req,res) => {
    res.send("sur")
})

app.listen("3001", "0.0.0.0", () => {
    console.log("Server is up!")
})
