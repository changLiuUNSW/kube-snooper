const express = require('express');
const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs');
const Client = require('kubernetes-client').Client;
const config = require('kubernetes-client').config;

const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 4000;

const kubeconfig = yaml.safeLoad(fs.readFileSync('./kubeConfig'));

const k8client = new Client({
  config: config.fromKubeconfig(kubeconfig),
  version: '1.8'
});

app.use(bodyParser.json());

// Serve static assets.
app.use(express.static(path.resolve(__dirname, 'build')));

app.listen(port);

app.get('/api/servers', (req, res) => {
  (async function getServers() {
    const services = await k8client.api.v1.namespaces('default').services.get();

    const filteredSvs = services.body.items.filter(x => x.status.loadBalancer.ingress); //filter the public facing server

    const servers = filteredSvs.map(x => {
      let name = x.metadata.name;
      let eip = x.status.loadBalancer.ingress[0].ip;
      let endpoints = {};
      x.spec.ports.forEach(x => {
        endpoints[x.name] = eip + ':' + x.targetPort;
      });

      return {
        name: name,
        endpoints: endpoints
      };
    });

    res.status(200).send(servers);
  })();
});

app.post('/api/servers/add', (req, res) => {
  (async function addServer() {
    const name = 'minecraft-' + new Date().valueOf();
    const deploymentReq = {
      body: {
        apiVersion: 'apps/v1beta1',
        kind: 'Deployment',
        metadata: {
          name: name
        },
        spec: {
          replicas: 1,
          selector: {
            matchLabels: {
              app: name
            }
          },
          template: {
            metadata: {
              labels: {
                app: name
              }
            },
            spec: {
              containers: [
                {
                  name: name,
                  image: 'openhack/minecraft-server:2.0',
                  env: [
                    {
                      name: 'EULA',
                      value: 'TRUE'
                    }
                  ],
                  ports: [
                    {
                      containerPort: 25565,
                      name: 'minecraft'
                    },
                    {
                      containerPort: 25575,
                      name: 'rcon'
                    }
                  ]
                }
              ]
            }
          }
        }
      }
    };

    try {
      const resp = await k8client.apis.apps.v1beta1
        .namespaces('default')
        .deployments.post(deploymentReq);
      console.log(resp);
    } catch (e) {
      console.log('error:', e);
    }

    const service = {
      body: {
        kind: 'Service',
        apiVersion: 'v1',
        metadata: {
          name: name
        },
        spec: {
          ports: [
            {
              name: 'minecraft',
              port: 25565,
              targetPort: 25565
            },
            {
              name: 'rcon',
              port: 25575,
              targetPort: 25575
            }
          ],
          selector: {
            app: name
          },
          type: 'LoadBalancer'
        }
      }
    };

    console.log('servie body:', service);

    try {
      const respSvr = await k8client.api.v1.namespaces('default').services.post(service);
      console.log(respSvr);
    } catch (e) {
      console.log('error:', e);
    }

    res.status(200).send(deploymentReq);
  })();
});

app.post('/api/servers/delete', (req, res) => {
  (async function deleteServer() {
    const services = await k8client.api.v1.namespaces('default').services.get();
    const delName = req.body.name;
    console.log('delete name:', delName);

    try {
      const resp = await k8client.api.v1
        .namespaces('default')
        .services(delName)
        .delete();
    } catch (e) {
      console.log(e);
    }
    try {
      const resp2 = await k8client.apis.apps.v1beta1
        .namespaces('default')
        .deployments(delName)
        .delete();
    } catch (e) {
      console.log(e);
    }

    res.status(200).send(services);
  })();
});
