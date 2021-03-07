const express = require("express")
const app = express()
const { createPod, getPods, execGetReq, deletePod, readSpecificPod } = require("./kubernetes-handler.js")

var mockPods = []
var idCounter = 0

var randNameStart = [
    "colossal", "brief", "absorbing", "psychotic", "synonymous", "handsomely", "jagged", "labored", "fertile", "separate", "short", "chilly", "tall", "jaded", "unkempt", "cagey", "slim", "curious", "regular", "vast", "mature", "black-and-white", "historical", "alleged", "teeny", "embarrassed", "nonchalant", "aromatic", "few", "acidic", "shaggy", "protective", "savory", "colorful", "dazzling", "crooked", "good", "moaning", "stormy", "momentous"
]

var randNameEnd = [
    "juice", "rings", "vest", "horse", "representative", "flowers", "quicksand", "sleep", "pest", "fact", "increase", "rule", "ice", "crayon", "stream", "dolls", "activity", "laborer", "plot", "letters", "wish", "jam", "hour", "mist", "chin", "trail", "temper", "tank", "straw", "sea", "grip", "reason", "suggestion", "leg", "plant", "ink", "way", "grass", "bushes", "walk"
]

function generateRandomName() {
    let start = randNameStart[Math.floor(Math.random() * randNameStart.length)]
    let mid = randNameStart[Math.floor(Math.random() * randNameStart.length)]
    let end = randNameEnd[Math.floor(Math.random() * randNameEnd.length)]
    return start + "-" + mid + "-" + end
}

app.use(express.static("public"))
app.use(express.json())

app.get("/", (req, res) => {
    res.redirect("/index")

})

app.use("/index", (req, res) => {
    res.sendFile(__dirname + "/public/html/index.html")
})

app.delete("/deletepod", async (req, res) => {
    console.log(req.body)
    let podName = await req.body.name
    let response = await deletePod(podName)
    res.send(response)
})

app.post("/createpod", async (req, res) => {
    const name = generateRandomName()
    await createPod(name)
    async function wait(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }

    let ipNotSet = true
    let podResponse
    while (ipNotSet) {
        await wait(1000)
        podResponse = await readSpecificPod(name)
        if (podResponse.body.status.podIP != undefined) {
            ipNotSet = false
        }
    }

    console.log("creates pod")
    res.send({ ip: podResponse.body.status.podIP, domainName: podResponse.body.metadata.name })
})

app.post("/ping", async (req, res) => {

    let count = await execGetReq(req.body.name, req.body.ip)
    res.send({ count: count })
})

app.get("/updatepings", async (req, res) => {
    let pods = await getPods()
    for (const pod of pods) {
        if (pod.container == "kubertest") {
            console.log(pod)
            let count = await execGetReq(pod.domainName, pod.ip, "/status")
            pod.count = count
        }
    }
    res.send(pods)
})

app.listen("3001", "0.0.0.0", () => {
    console.log("Server is up!")
})
