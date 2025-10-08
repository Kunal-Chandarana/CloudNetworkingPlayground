# 🚀 Getting Started with Service Mesh Learning

Welcome to your Service Mesh Learning Playground! This guide will help you get started with your first learning scenario.

## 🎯 First Learning Scenario: Basic Service Mesh Setup

### What You'll Learn
- How service mesh architecture works
- How Envoy proxies handle service communication
- How to observe and monitor service mesh traffic
- Basic Istio configuration and deployment

### ⚡ Quick Start (Recommended)

Run the quick start script to automatically set up your first scenario:

```bash
./scripts/quick-start.sh
```

This script will:
1. ✅ Check prerequisites (kubectl, istioctl)
2. 🔧 Install Istio if needed
3. 🚀 Deploy sample microservices
4. ⏳ Wait for deployments to be ready
5. 📋 Show you next steps

### 📖 Manual Setup (Step by Step)

If you prefer to follow along manually, read the complete guide:

```bash
cat scenarios/basic-setup/first-scenario.md
```

### 🔍 What You'll See

After running the quick start, you'll have:

1. **3 Microservices** running with Envoy sidecar proxies:
   - Frontend (React web app)
   - API Gateway (traffic routing)
   - User Service (user management)

2. **Service Mesh Features**:
   - Automatic mTLS between services
   - Service discovery
   - Load balancing
   - Health checking
   - Metrics collection

### 🌐 Access Your Application

1. **Frontend Web App**:
   ```bash
   kubectl port-forward svc/frontend 3000:80 -n service-mesh-playground
   # Open http://localhost:3000
   ```

2. **Envoy Admin Interface**:
   ```bash
   kubectl port-forward deployment/frontend 15000:15000 -n service-mesh-playground
   # Open http://localhost:15000
   ```

3. **Check Pods** (notice the sidecar containers):
   ```bash
   kubectl get pods -n service-mesh-playground
   kubectl describe pod -l app=frontend -n service-mesh-playground
   ```

### 🧪 Test Service Communication

```bash
# Test frontend health
kubectl exec -it deployment/frontend -n service-mesh-playground -- curl http://localhost:3000/health

# Test API gateway health
kubectl exec -it deployment/api-gateway -n service-mesh-playground -- curl http://localhost:8080/health

# Test user service health
kubectl exec -it deployment/user-service -n service-mesh-playground -- curl http://localhost:3001/health
```

### 📊 Explore Envoy Metrics

```bash
# Check request statistics
curl http://localhost:15000/stats | grep requests_total

# Check service clusters
curl http://localhost:15000/clusters

# Check configuration
curl http://localhost:15000/config_dump | jq '.configs[1].dynamic_route_configs'
```

## 🎓 Learning Path

After completing the first scenario, you'll be ready for:

1. **Traffic Management** (`scenarios/traffic-management/`)
   - Canary deployments
   - A/B testing
   - Load balancing

2. **Security** (`scenarios/security/`)
   - mTLS implementation
   - Authorization policies
   - Rate limiting

3. **Observability** (`scenarios/observability/`)
   - Prometheus metrics
   - Jaeger tracing
   - Grafana dashboards

4. **Resilience** (`scenarios/resilience/`)
   - Circuit breakers
   - Retry policies
   - Fault injection

## 🛠️ Prerequisites

- **Kubernetes cluster** (minikube, kind, or cloud provider)
- **kubectl** configured and working
- **Docker** installed
- **Istio** (will be installed automatically by quick-start script)

## 🐛 Troubleshooting

### Common Issues:

1. **"kubectl not found"**: Install kubectl and configure it for your cluster
2. **"istioctl not found"**: The quick-start script will install Istio automatically
3. **"Pods not starting"**: Check if your cluster has enough resources
4. **"Services not communicating"**: Verify Istio sidecar injection is enabled

### Debug Commands:

```bash
# Check cluster status
kubectl cluster-info

# Check Istio installation
kubectl get pods -n istio-system

# Check sidecar injection
kubectl get pods -n service-mesh-playground -o jsonpath='{.items[*].spec.containers[*].name}'

# Analyze service mesh
istioctl analyze -n service-mesh-playground
```

## 📚 Additional Resources

- **Complete Documentation**: `docs/concepts/service-mesh-fundamentals.md`
- **All Scenarios**: `scenarios/` directory
- **Kubernetes Manifests**: `k8s/` directory
- **Setup Scripts**: `scripts/` directory

## 🎉 Ready to Start?

Run the quick start script and begin your service mesh learning journey:

```bash
./scripts/quick-start.sh
```

Happy learning! 🚀
