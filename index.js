const express = require("express")
const app = express()
const {createPod} = require("./kubernetes-handler.js")

app.use(express.static("public"))
app.use(express.json())

app.get("/", (req,res) => {
    res.redirect("/index")
})

app.use("/index", (req, res) => {
    res.sendFile(__dirname + "/public/html/index.html")
})

app.delete("/deletepod", (req,res) => {
    console.log("deletes pod")
    res.send("pod deleted!")
})

app.post("/createpod", (req, res) => {
    console.log("creates pod")
    res.send("pod created")
})

app.get("/test", (req,res) => {
    res.send("hej")
    createPod()
})

app.get("/pods", (req,res) => {
    let mockPod1 = {id: 181239123, ip: "127.0.0.1", domainName: "something"}
    let mockPod2 = {id: 181212312323, ip: "127.0.0.1", domainName: "somasawdhing"}
    let mockPod3 = {id: 18689239123, ip: "127.0.0.1", domainName: "soadddding"}
    let mockPod4 = {id: 181239123, ip: "127.0.0.1", domainName: "someawdawdhing"}
    let mockPodArray = [mockPod1, mockPod2, mockPod3, mockPod4]
    res.send(mockPodArray)
})

app.listen("30", "0.0.0.0", () => {
    console.log("Server is up!")
})
