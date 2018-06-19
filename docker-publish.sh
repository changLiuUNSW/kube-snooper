#!/bin/sh

docker build -t changliuunsw/kubesnooper .
docker login -u "$DOCKER_USERNAME" -p "$DOCKER_PASSWORD";
docker push changliuunsw/kubesnooper