const k8s = require('@kubernetes/client-node');
const { V1Container, V1Pod } = require("@kubernetes/client-node");
const { stat } = require('fs');
const WebSocket = require('ws')
const fs = require('fs')
const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const appsV1Api = kc.makeApiClient(k8s.AppsV1Api);
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);


async function getPods() {
    let respond = await k8sApi.listNamespacedPod('default')
    let podList = []
    for (const element of respond.body.items) {
        if (element.spec.containers[0].name == "kubertest") {
            let domainName = element.metadata.name
            let ip = element.status.podIP
            let id = element.metadata.uid

            let pod = { id: id, ip: ip, domainName: domainName, count: 0 }
            podList.push(pod)
        }
    }
    return podList
}

async function readSpecificPod(name) {
    let response = await k8sApi.readNamespacedPod(name, 'default')
    return response
}

async function execGetReq(podName, podIP, endpoint = "") {
    if (podIP != undefined) {
        const execPromise = new Promise((resolve, reject) => {
            url = 'wss://127.0.0.1:32768/api/v1/namespaces/default/pods/' + podName + '/exec?stdout=true&stderr=false&stdin=true&tty=true&command=curl&command=http://' + podIP + ':5000' + endpoint + '&container=kubertest'
            console.log(url)
            sock = new WebSocket(url, {
                ca: fs.readFileSync(`${process.env.HOME}/.minikube/ca.crt`),
                cert: fs.readFileSync(`${process.env.HOME}/.minikube/profiles/minikube/client.crt`),
                key: fs.readFileSync(`${process.env.HOME}/.minikube/profiles/minikube/client.key`)
            });
            sock.on('message', x => {
                let count = x.toString()
                if (count != "\u0001") {
                    let reformatedCount = count.replace("\u0001", "")
                    resolve(reformatedCount)
                }
            });
        })
        let count = await execPromise
        return count
    } else {
        return 0
    }

}


//k8sApi.deleteNamespacedPod()

async function deletePod(name) {
    let response = await k8sApi.deleteNamespacedPod(name, "default", undefined, undefined, 0)
    return response;
}

async function createPod(name) {
    let response = await k8sApi.createNamespacedPod('default', {
        apiVersion: "v1",
        kind: "Pod",
        metadata: {
            name: name
        },
        spec: {
            containers: [
                {
                    name: "kubertest",
                    image: "frederikbroth/kubertest:latest",
                    ports: [
                        {
                            containerPort: 5000
                        }
                    ]
                }
            ]
        }
    })
    return response
}

module.exports.createPod = createPod
module.exports.getPods = getPods
module.exports.execGetReq = execGetReq
module.exports.deletePod = deletePod
module.exports.readSpecificPod = readSpecificPod