# Kube-snooper
Kubernate server dashboard for Microsoft OpenHack - Container

[OMDb API](http://www.omdbapi.com/)

## How to start

**Note** this project is based on node v8.1.4 and npm 5.0.3.

```bash
# install the project's dependencies
npm install
# Runs the app in development mode.
npm run dev
# Generate production bundle
npm start
```

## Docker

```bash
# build and publish
./docker-publish.sh
```

## Kubernate

```bash
# Deployment
kubectl apply -f kubesnooper-deploy.yaml
# Sevice
kubectl apply -f kubesnooper-service.yaml