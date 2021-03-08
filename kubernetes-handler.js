const k8s = require('@kubernetes/client-node');
const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const appsV1Api = kc.makeApiClient(k8s.AppsV1Api);
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const ingressK8 = kc.makeApiClient(k8s.NetworkingV1Api)

async function createServiceAndDeployment(username) {
    let deployment = await appsV1Api.createNamespacedDeployment('default', {
        apiVersion: "apps/v1",
        kind: "Deployment",
        metadata: {
            name: username,
            labels: {
                app: username
            }
        },
        spec: {
            selector: {
                matchLabels: {
                    app: username
                }
            },
            template: {
                metadata: {
                    labels: {
                        app: username
                    }
                },
                spec: {
                    containers: [
                        {
                            name: "usercontainer",
                            image: "lomztein/socketio-chatroom:latest",
                            ports: [
                                {
                                    containerPort: 3002
                                }
                            ]
                        }
                    ]
                }
            }
        }

    })
    console.log(deployment)
    let response = await k8sApi.createNamespacedService('default', {
        apiVersion: "v1",
        kind: "Service",
        metadata: {
            name: username,
            labels: {
                app: username
            }
        },
        spec: {
            type: "NodePort",
            ports: [
                {
                    port: 81,
                    targetPort: 3002
                }
            ],
            selector: {
                app: username
            }
        }
    })
    console.log(response)
    await patchIngressAdd(username)
}

async function removeServiceAndDeployment(username){
    let service = await k8sApi.deleteNamespacedService(username, "default")
    console.log(service)
    let deployment = await appsV1Api.deleteNamespacedDeployment(username, "default")
    console.log(deployment)
}
async function patchIngressAdd(username) {
    const patch = [
        {
            "op": "add",
            "path": "/spec/rules/0/http/paths/-",
            "value": {
                "path": "/" + username + "/?(.*)",
                "pathType": "Prefix",
                "backend": {
                    "service": {
                        "name": username,
                        "port": {
                            "number": 81
                        }
                    }
                }
            }
        }
    ]
    const options = { "headers": { "Content-type": k8s.PatchUtils.PATCH_FORMAT_JSON_PATCH}};
    let response = await ingressK8.patchNamespacedIngress("chat-ingress", 'default', patch, undefined, undefined, undefined, undefined, options )
    return response
}

async function patchIngressRemove(index) {
    const patch = [
        {
            "op": "remove",
            "path": "/spec/rules/0/http/paths/" + index
        }
    ]
    const options = { "headers": { "Content-type": k8s.PatchUtils.PATCH_FORMAT_JSON_PATCH}};
    let response = await ingressK8.patchNamespacedIngress("chat-ingress", 'default', patch, undefined, undefined, undefined, undefined, options )
    return response
}   

async function getIngressServices(){
    let ingressPaths = await ingressK8.readNamespacedIngressStatus("chat-ingress", "default")
    return ingressPaths
}
async function removeDeadServices(){
    const ingressServices = await getServices().body.spec.rules[0].http.paths.map(service => service.backend.service.name)
    console.log(ingressServices)
    let runningServices = await appsV1Api.listNamespacedDeployment('default')
    const runningServicesNames = runningServices.body.items.map(service => service.metadata.name)
    for(const [index, value] of ingressServices.entries()){
        if(runningServicesNames.find(name => name == value)){
            console.log("found service " + value)
        } else {
            await patchIngressRemove(index)
        }
    }
}
module.exports.createServiceAndDeployment = createServiceAndDeployment
module.exports.patchIngressAdd = patchIngressAdd
module.exports.removeDeadServices = removeDeadServices
module.exports.removeServiceAndDeployment = removeServiceAndDeployment
module.exports.getIngressServices = getIngressServices