const k8s = require('@kubernetes/client-node');
const { V1Container, V1Pod } = require("@kubernetes/client-node");

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const appsV1Api = kc.makeApiClient(k8s.AppsV1Api);
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

k8sApi.listNamespacedPod('default').then((res) => {
    console.log(res.body.items);
});

function createPod() {
    k8sApi.createNamespacedPod('default', {
        apiVersion: "v1",
        kind: "Pod",
        metadata: {
            name: "userpod-15"
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
    }).then(test => {
        console.log(test.body)
    }) 
}

module.exports.createPod = createPod