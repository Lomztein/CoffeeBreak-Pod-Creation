const express = require("express")
const app = express()
const {createServiceAndDeployment, patchIngressAdd, removeDeadServices, removeServiceAndDeployment} = require("./kubernetes-handler")

var mockPods = []
var idCounter = 0

var randNameStart = [
    "colossal","brief","absorbing","psychotic","synonymous","handsomely","jagged","labored","fertile","separate","short","chilly","tall","jaded","unkempt","cagey","slim","curious","regular","vast","mature","black-and-white","historical","alleged","teeny","embarrassed","nonchalant","aromatic","few","acidic","shaggy","protective","savory","colorful","dazzling","crooked","good","moaning","stormy","momentous"
]

var randNameEnd = [
    "juice","rings","vest","horse","representative","flowers","quicksand","sleep","pest","fact","increase","rule","ice","crayon","stream","dolls","activity","laborer","plot","letters","wish","jam","hour","mist","chin","trail","temper","tank","straw","sea","grip","reason","suggestion","leg","plant","ink","way","grass","bushes","walk"
]

async function generateMockPod () {
    let pod = 
    {
        id: idCounter,
        ip: "127.0.0." + Math.floor(Math.random() * 255 + 1),
        domainName: generateRandomName()
    }
    idCounter++;
    //let response = await createServiceAndDeployment(pod.domainName)
    //let response = await patchIngress()

    //await removeServiceAndDeployment("few-savory-jam")
    await removeDeadServices()
    return pod;
}

function generateRandomName () {
    let start = randNameStart[Math.floor(Math.random() * randNameStart.length)]
    let mid = randNameStart[Math.floor(Math.random() * randNameStart.length)]
    let end = randNameEnd[Math.floor(Math.random() * randNameEnd.length)]
    return start + "-" + mid + "-" + end
}

function deleteMockPod (id) {
    mockPods = mockPods.filter(pod => !(pod.id == id));
}

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
    console.log(req.body)
    let pod = req.body
    deleteMockPod(pod.id)
    res.send("pod deleted!")
})

app.post("/createpod", (req, res) => {
    console.log("creates pod")
    mockPods.push(generateMockPod());
    res.send("pod created")
    
})

app.get("/test", (req,res) => {
    res.send("hej")
})

app.get("/pods", (req,res) => {
    console.log(mockPods);
    res.send(mockPods)
})

app.listen("3001", "0.0.0.0", () => {
    console.log("Server is up!")
})
