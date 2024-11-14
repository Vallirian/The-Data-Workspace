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
  --docker-server=975050343564.dkr.ecr.eu-west-2.amazonaws.com \
  --docker-username=AWS \
  --docker-password="$ECR_PASSWORD" 

kubectl delete secret aws-ecr-reg-cred # delete secret

# login to ecr: required for docker buildx (from local to ecr)
aws ecr get-login-password \
    --region eu-west-2 \
| docker login \
    --username AWS \
    --password-stdin 975050343564.dkr.ecr.eu-west-2.amazonaws.com


apply all
---------
kubectl apply -f secrets.yaml -f backend.yaml -f frontend.yaml

get url
-------
minikube service webapp 
minikube service webapp -n dev

K8s commands
------------
aws eks --region eu-west-2 update-kubeconfig --name arc # update context
kubectl config get-contexts # get all contexts
kubectl config current-context # get current context

kubectl get all        
kubectl get services

kubectl get pods --all-namespaces
kubectl get pods -o wide
kubectl describe pod [pod-name]
kubectl logs [pod id]
kubectl logs -f [pod id] # see logs realtime
kubectl rollout restart deployment [deployment-name] # restart a whole deployment
kubectl delete pod -l app=<your-app-label> # delete all pods with a specific label

kubectl delete rs <replicaset-name>


kubectl scale deployment <deployment-name> --replicas=0
kubectl scale deployment <deployment-name> --replicas=1

kubectl exec -it <pod-name> -- <command>


tag subnets
-----------
Private
-------
aws ec2 create-tags --resources subnet-04e5d5c4d496179a2 --tags Key=kubernetes.io/cluster/arc,Value=shared
aws ec2 create-tags --resources subnet-04e5d5c4d496179a2 --tags Key=kubernetes.io/role/internal-elb,Value=1

aws ec2 create-tags --resources subnet-07a1e52a967aced5d --tags Key=kubernetes.io/cluster/arc,Value=shared
aws ec2 create-tags --resources subnet-07a1e52a967aced5d --tags Key=kubernetes.io/role/internal-elb,Value=1

aws ec2 create-tags --resources subnet-09e115d6536c01dc7 --tags Key=kubernetes.io/cluster/arc,Value=shared
aws ec2 create-tags --resources subnet-09e115d6536c01dc7 --tags Key=kubernetes.io/role/internal-elb,Value=1

Public
------
aws ec2 create-tags --resources 	subnet-057ce0887698fbb63 --tags Key=kubernetes.io/cluster/arc,Value=shared
aws ec2 create-tags --resources 	subnet-057ce0887698fbb63 --tags Key=kubernetes.io/role/elb,Value=1

aws ec2 create-tags --resources 	subnet-03a42c8b87fa1f3cf --tags Key=kubernetes.io/cluster/arc,Value=shared
aws ec2 create-tags --resources 	subnet-03a42c8b87fa1f3cf --tags Key=kubernetes.io/role/elb,Value=1

aws ec2 create-tags --resources 	subnet-003af9509c6add306 --tags Key=kubernetes.io/cluster/arc,Value=shared
aws ec2 create-tags --resources 	subnet-003af9509c6add306 --tags Key=kubernetes.io/role/elb,Value=1


create iam policy
-----------------
aws iam create-policy \
    --policy-name AWSLoadBalancerControllerIAMPolicy \
    --policy-document file://iam_policy.json

eksctl utils associate-iam-oidc-provider --cluster arc --approve
 
eksctl create iamserviceaccount \
    --cluster=arc \
    --name=aws-load-balancer-controller \
    --namespace=kube-system \
    --attach-policy-arn=arn:aws:iam::975050343564:policy/AWSLoadBalancerControllerIAMPolicy \
    --approve

kubectl get sa -n kube-system

kubectl apply \
    --validate=false \
    -f https://github.com/jetstack/cert-manager/releases/download/v1.5.4/cert-manager.yaml