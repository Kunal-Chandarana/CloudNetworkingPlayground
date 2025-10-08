#!/bin/bash

# Quick Start Script for First Learning Scenario
# This script helps you get started with the first service mesh learning scenario

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🎯 Service Mesh Learning - First Scenario"
echo "=========================================="
echo ""

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed. Please install kubectl first."
        exit 1
    fi
    
    if ! command -v istioctl &> /dev/null; then
        print_error "istioctl is not installed. Please install Istio first."
        print_status "To install Istio, run:"
        echo "curl -L https://istio.io/downloadIstio | sh -"
        echo "cd istio-*"
        echo "export PATH=\$PWD/bin:\$PATH"
        echo "istioctl install --set values.defaultRevision=default -y"
        exit 1
    fi
    
    if ! kubectl cluster-info &> /dev/null; then
        print_error "kubectl is not configured or cluster is not accessible."
        exit 1
    fi
    
    print_success "All prerequisites are met!"
}

# Install Istio if needed
install_istio() {
    print_status "Checking Istio installation..."
    
    if kubectl get namespace istio-system &> /dev/null; then
        print_success "Istio is already installed!"
    else
        print_status "Installing Istio..."
        istioctl install --set values.defaultRevision=default -y
        print_success "Istio installed successfully!"
    fi
    
    # Enable sidecar injection
    kubectl label namespace default istio-injection=enabled --overwrite
    print_success "Sidecar injection enabled for default namespace!"
}

# Deploy sample application
deploy_sample_app() {
    print_status "Deploying sample application..."
    
    # Create namespace
    kubectl create namespace service-mesh-playground --dry-run=client -o yaml | kubectl apply -f -
    kubectl label namespace service-mesh-playground istio-injection=enabled --overwrite
    
    # Deploy services
    kubectl apply -f k8s/base/namespace.yaml
    kubectl apply -f k8s/base/frontend-deployment.yaml
    kubectl apply -f k8s/base/api-gateway-deployment.yaml
    kubectl apply -f k8s/base/user-service-deployment.yaml
    
    print_success "Sample application deployed!"
}

# Wait for deployments
wait_for_deployments() {
    print_status "Waiting for deployments to be ready..."
    
    kubectl wait --for=condition=available --timeout=300s deployment/frontend -n service-mesh-playground
    kubectl wait --for=condition=available --timeout=300s deployment/api-gateway -n service-mesh-playground
    kubectl wait --for=condition=available --timeout=300s deployment/user-service -n service-mesh-playground
    
    print_success "All deployments are ready!"
}

# Show next steps
show_next_steps() {
    print_success "🎉 First scenario setup complete!"
    echo ""
    echo "📋 Next Steps:"
    echo "=============="
    echo ""
    echo "1. 📖 Read the first scenario guide:"
    echo "   cat scenarios/basic-setup/first-scenario.md"
    echo ""
    echo "2. 🔍 Check your pods (notice the sidecar containers):"
    echo "   kubectl get pods -n service-mesh-playground"
    echo "   kubectl describe pod -l app=frontend -n service-mesh-playground"
    echo ""
    echo "3. 🌐 Access the frontend application:"
    echo "   kubectl port-forward svc/frontend 3000:80 -n service-mesh-playground"
    echo "   Then open: http://localhost:3000"
    echo ""
    echo "4. 🔧 Access Envoy admin interface:"
    echo "   kubectl port-forward deployment/frontend 15000:15000 -n service-mesh-playground"
    echo "   Then open: http://localhost:15000"
    echo ""
    echo "5. 📊 Check Envoy metrics:"
    echo "   curl http://localhost:15000/stats | grep requests_total"
    echo ""
    echo "6. 🧪 Test service communication:"
    echo "   kubectl exec -it deployment/frontend -n service-mesh-playground -- curl http://localhost:3000/health"
    echo ""
    echo "📚 Follow the complete guide in scenarios/basic-setup/first-scenario.md"
    echo ""
}

# Main execution
main() {
    check_prerequisites
    install_istio
    deploy_sample_app
    wait_for_deployments
    show_next_steps
}

# Run main function
main "$@"
