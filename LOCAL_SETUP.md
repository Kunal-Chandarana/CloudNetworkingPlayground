# 🏠 Local Kubernetes Setup for Service Mesh Learning

Since you have AWS EKS clusters configured but credentials aren't set up, let's use a local Kubernetes cluster for learning. This is actually better for learning as it's faster and doesn't cost anything!

## 🎯 Option 1: Minikube (Recommended)

Minikube is the easiest way to run Kubernetes locally.

### Install Minikube

**On macOS:**
```bash
# Using Homebrew
brew install minikube

# Or download directly
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-darwin-amd64
sudo install minikube-darwin-amd64 /usr/local/bin/minikube
```

**On Linux:**
```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

### Start Minikube
```bash
# Start minikube with enough resources for Istio
minikube start --memory=4096 --cpus=2

# Verify it's working
kubectl get nodes
```

## 🎯 Option 2: Kind (Kubernetes in Docker)

Kind runs Kubernetes clusters in Docker containers.

### Install Kind
```bash
# On macOS
brew install kind

# On Linux
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind
```

### Create Kind Cluster
```bash
# Create cluster with enough resources
kind create cluster --config - <<EOF
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        system-reserved: memory=1Gi
        kube-reserved: memory=1Gi
  extraPortMappings:
  - containerPort: 30000
    hostPort: 30000
    protocol: TCP
  - containerPort: 30001
    hostPort: 30001
    protocol: TCP
EOF

# Verify it's working
kubectl get nodes
```

## 🎯 Option 3: Docker Desktop (If Available)

If you have Docker Desktop with Kubernetes enabled:

1. Open Docker Desktop
2. Go to Settings → Kubernetes
3. Enable Kubernetes
4. Wait for it to start

## ✅ Verify Your Setup

After setting up any of the above options, verify everything works:

```bash
# Check cluster status
kubectl cluster-info

# Check nodes
kubectl get nodes

# Check if you can create resources
kubectl create namespace test
kubectl delete namespace test
```

## 🚀 Now Run the Quick Start!

Once you have a local cluster running, you can proceed with the service mesh learning:

```bash
./scripts/quick-start.sh
```

## 🔧 Troubleshooting

### Minikube Issues:
```bash
# If minikube won't start
minikube delete
minikube start --memory=4096 --cpus=2

# Check minikube status
minikube status
```

### Kind Issues:
```bash
# If kind cluster has issues
kind delete cluster
kind create cluster
```

### Docker Desktop Issues:
- Make sure Docker Desktop is running
- Check that Kubernetes is enabled in settings
- Restart Docker Desktop if needed

## 💡 Why Local is Better for Learning

1. **Faster**: No network latency
2. **Free**: No cloud costs
3. **Isolated**: Won't affect production clusters
4. **Repeatable**: Easy to reset and start over
5. **Offline**: Works without internet after setup

## 🎯 Next Steps

1. Choose one of the local options above
2. Set it up and verify it works
3. Run `./scripts/quick-start.sh`
4. Start learning service mesh concepts!

Let me know which option you'd like to use, and I can help you get it set up!
