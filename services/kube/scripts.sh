reset minikube
--------------
minikube stop
minikube delete
minikube start --cpus=2 --memory=4000 --network-plugin=cni --cni=calico

open minikube dashboard
-----------------------
minikube dashboard

create images
-------------
eval $(minikube docker-env)

cd api/
docker build --no-cache -t api:latest .

cd ../webapp/
docker build --no-cache -t webapp:latest .


apply all
---------
kubectl apply -f secrets.yaml -f backend.yaml -f frontend.yaml

get url
-------
minikube service webapp 
minikube service webapp -n dev

K8s commands
------------
kubectl get pods --all-namespaces
kubectl get pods -o wide
kubectl describe pod [pod-name]
kubectl logs [pod id]
kubectl logs -f [pod id] # see logs realtime
kubectl rollout restart deployment [deployment-name] # restart a whole deployment
kubectl delete pod -l app=<your-app-label> # delete all pods with a specific label
