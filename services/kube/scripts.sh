docker
------
docker inspect api:latest | grep Architecture # check image architecture

reset minikube
--------------
minikube stop
minikube delete
minikube start --cpus=2 --memory=4000 --network-plugin=cni --cni=calico

eks
---
eksctl create cluster -f cluster.yaml
kubectl apply -f namespace.yaml


open minikube dashboard
-----------------------
minikube dashboard

local create images
-------------------
eval $(minikube docker-env)

cd api/
docker build --no-cache -t api:latest .

cd ../webapp/
docker build --no-cache -t webapp:latest .

prod create images
------------------
cd api/
docker buildx build --platform linux/amd64 --no-cache -t 975050343564.dkr.ecr.eu-west-2.amazonaws.com/api:latest --push .


cd ../webapp/
docker buildx build --platform linux/amd64 --no-cache -t 975050343564.dkr.ecr.eu-west-2.amazonaws.com/webapp:latest --push .

ecr login
---------
ECR_PASSWORD=$(aws ecr get-login-password --region eu-west-2)
kubectl create secret docker-registry aws-ecr-reg-cred \
  --docker-server=<account-id>.dkr.ecr.eu-west-2.amazonaws.com \
  --docker-username=AWS \
  --docker-password="$ECR_PASSWORD"


apply all
---------
kubectl apply -f secrets.yaml -f backend.yaml -f frontend.yaml

get url
-------
minikube service webapp 
minikube service webapp -n dev

K8s commands
------------
aws eks --region eu-west-2 update-kubeconfig --name my-cluster # update context
kubectl config get-contexts # get all contexts
kubectl config current-context # get current context

kubectl get pods --all-namespaces
kubectl get pods -o wide
kubectl describe pod [pod-name]
kubectl logs [pod id]
kubectl logs -f [pod id] # see logs realtime
kubectl rollout restart deployment [deployment-name] # restart a whole deployment
kubectl delete pod -l app=<your-app-label> # delete all pods with a specific label
