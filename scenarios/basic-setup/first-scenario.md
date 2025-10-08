# First Learning Scenario: Basic Service Mesh Setup

## 🎯 Objective
Learn the fundamentals of service mesh communication by setting up a basic microservices application with Istio and observing how Envoy proxies handle service-to-service communication.

## 📋 Prerequisites
- Kubernetes cluster running (minikube, kind, or cloud provider)
- kubectl configured and working
- Istio installed (we'll guide you through this)
- Docker installed

## 🚀 Step 1: Verify Your Environment

Let's start by checking your current setup:

```bash
# Check if kubectl is working
kubectl cluster-info

# Check if Istio is installed
istioctl version

# Check current namespaces
kubectl get namespaces
```

If Istio is not installed, we'll install it in the next step.

## 🔧 Step 2: Install Istio (if needed)

```bash
# Download and install Istio
curl -L https://istio.io/downloadIstio | sh -
cd istio-*
export PATH=$PWD/bin:$PATH

# Install Istio with default profile
istioctl install --set values.defaultRevision=default -y

# Enable automatic sidecar injection for default namespace
kubectl label namespace default istio-injection=enabled --overwrite

# Verify installation
kubectl get pods -n istio-system
```

## 🏗️ Step 3: Deploy Our Sample Application

Let's deploy a simple application to see the service mesh in action:

```bash
# Create namespace for our playground
kubectl create namespace service-mesh-playground
kubectl label namespace service-mesh-playground istio-injection=enabled

# Deploy the application
kubectl apply -f k8s/base/namespace.yaml
kubectl apply -f k8s/base/frontend-deployment.yaml
kubectl apply -f k8s/base/api-gateway-deployment.yaml
kubectl apply -f k8s/base/user-service-deployment.yaml
```

## 👀 Step 4: Observe the Service Mesh in Action

### 4.1 Check Pod Status
```bash
# Watch the pods being created
kubectl get pods -n service-mesh-playground -w

# Notice that each pod has 2 containers: your app + Envoy proxy
kubectl describe pod -l app=frontend -n service-mesh-playground
```

**What to observe**: Each pod should have 2 containers - your application container and an `istio-proxy` container (Envoy).

### 4.2 Check Service Discovery
```bash
# List all services
kubectl get svc -n service-mesh-playground

# Check service endpoints
kubectl get endpoints -n service-mesh-playground
```

### 4.3 Test Service Communication
```bash
# Test frontend health endpoint
kubectl exec -it deployment/frontend -n service-mesh-playground -- curl http://localhost:3000/health

# Test API gateway health endpoint
kubectl exec -it deployment/api-gateway -n service-mesh-playground -- curl http://localhost:8080/health

# Test user service health endpoint
kubectl exec -it deployment/user-service -n service-mesh-playground -- curl http://localhost:3001/health
```

## 🔍 Step 5: Explore Envoy Proxy Configuration

### 5.1 Access Envoy Admin Interface
```bash
# Port forward to access Envoy admin interface
kubectl port-forward deployment/frontend 15000:15000 -n service-mesh-playground

# In another terminal, check Envoy configuration
curl http://localhost:15000/config_dump | jq '.configs[1].dynamic_route_configs'
```

### 5.2 Check Envoy Metrics
```bash
# Access Envoy metrics
curl http://localhost:15000/stats | grep -E "(upstream|downstream)"
```

### 5.3 View Service Topology
```bash
# Check what services Envoy knows about
curl http://localhost:15000/clusters
```

## 📊 Step 6: Generate Some Traffic

### 6.1 Access the Frontend
```bash
# Port forward to frontend
kubectl port-forward svc/frontend 3000:80 -n service-mesh-playground

# Open http://localhost:3000 in your browser
# Click "Load Products" and "Simulate Traffic" buttons
```

### 6.2 Monitor Traffic in Envoy
```bash
# Check request statistics
curl http://localhost:15000/stats | grep -E "requests_total|response_code"

# Check connection statistics
curl http://localhost:15000/stats | grep -E "upstream_cx_|downstream_cx_"
```

## 🎓 Step 7: Understanding What Happened

### Key Observations:

1. **Sidecar Injection**: Each pod automatically got an Envoy proxy sidecar
2. **Service Discovery**: Services can find each other by name (e.g., `api-gateway:8080`)
3. **Traffic Interception**: All traffic goes through Envoy proxies
4. **Metrics Collection**: Envoy automatically collects metrics about all requests

### What the Service Mesh Provides:

- **Automatic mTLS**: All service-to-service communication is encrypted
- **Load Balancing**: Requests are distributed across service instances
- **Health Checking**: Unhealthy instances are automatically removed
- **Metrics**: Detailed statistics about all network traffic

## 🔧 Step 8: Apply Basic Istio Configuration

Let's add some basic Istio configuration to see more features:

```bash
# Apply Istio gateway and virtual service
kubectl apply -f k8s/istio/gateway.yaml
kubectl apply -f k8s/istio/virtual-services.yaml
kubectl apply -f k8s/istio/destination-rules.yaml
```

### 8.1 Test External Access
```bash
# Get the external IP of Istio gateway
kubectl get svc istio-ingressgateway -n istio-system

# Test external access (replace EXTERNAL-IP with actual IP)
curl -H "Host: service-mesh-playground.local" http://EXTERNAL-IP/health
```

## 🎯 Step 9: Key Learning Points

### What You've Learned:

1. **Service Mesh Architecture**: How sidecar proxies work
2. **Automatic Injection**: How Istio automatically adds Envoy to pods
3. **Service Discovery**: How services find each other in the mesh
4. **Traffic Interception**: How all traffic flows through proxies
5. **Observability**: How to access Envoy metrics and configuration

### Key Commands to Remember:

```bash
# Check pod containers (should see istio-proxy)
kubectl describe pod <pod-name> -n service-mesh-playground

# Access Envoy admin interface
kubectl port-forward deployment/<service> 15000:15000 -n service-mesh-playground

# Check Envoy metrics
curl http://localhost:15000/stats

# Check Envoy configuration
curl http://localhost:15000/config_dump
```

## 🚀 Next Steps

Now that you understand the basics, you're ready for:

1. **Traffic Management**: Canary deployments and A/B testing
2. **Security**: mTLS and authorization policies
3. **Observability**: Prometheus metrics and Jaeger tracing
4. **Resilience**: Circuit breakers and retry policies

## 🐛 Troubleshooting

### Common Issues:

1. **Pods not starting**: Check if Istio is properly installed
2. **No sidecar injection**: Verify namespace has `istio-injection=enabled` label
3. **Services not communicating**: Check service names and ports
4. **Envoy admin not accessible**: Ensure port-forward is working

### Debug Commands:

```bash
# Check Istio installation
kubectl get pods -n istio-system

# Check sidecar injection
kubectl get pods -n service-mesh-playground -o jsonpath='{.items[*].spec.containers[*].name}'

# Check service mesh configuration
istioctl analyze -n service-mesh-playground
```

## 🎉 Congratulations!

You've successfully completed your first service mesh learning scenario! You now understand:

- How service mesh architecture works
- How Envoy proxies handle service communication
- How to observe and monitor service mesh traffic
- Basic Istio configuration and deployment

Ready for the next scenario? Let's move on to **Traffic Management** where you'll learn about canary deployments and A/B testing!
