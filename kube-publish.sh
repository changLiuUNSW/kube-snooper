#!/bin/sh

docker build -t changliuunsw/kubesnooper .
docker login -u "$DOCKER_USERNAME" -p "$DOCKER_PASSWORD";
docker push changliuunsw/kubesnooper

curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl
chmod +x ./kubectl
sudo mv ./kubectl /usr/local/bin/kubectl

mkdir ${HOME}/.kube
cp kubeConfig ${HOME}/.kube/config

kubectl delete deployment kubesnooper
kubectl apply -f kubesnooper-deploy.yaml