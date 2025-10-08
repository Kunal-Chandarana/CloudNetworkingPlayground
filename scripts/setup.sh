#!/bin/bash

# Service Mesh Playground Setup Script
# This script sets up the complete service mesh learning environment

set -e

echo "🚀 Setting up Service Mesh Playground..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed. Please install kubectl first."
        exit 1
    fi
    
    # Check if istioctl is installed
    if ! command -v istioctl &> /dev/null; then
        print_error "istioctl is not installed. Please install Istio first."
        exit 1
    fi
    
    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if kubectl is configured
    if ! kubectl cluster-info &> /dev/null; then
        print_error "kubectl is not configured or cluster is not accessible."
        exit 1
    fi
    
    print_success "All prerequisites are met!"
}

# Install Istio
install_istio() {
    print_status "Installing Istio..."
    
    # Check if Istio is already installed
    if kubectl get namespace istio-system &> /dev/null; then
        print_warning "Istio is already installed. Skipping installation."
        return
    fi
    
    # Install Istio with default profile
    istioctl install --set values.defaultRevision=default -y
    
    # Enable automatic sidecar injection for default namespace
    kubectl label namespace default istio-injection=enabled --overwrite
    
    print_success "Istio installed successfully!"
}

# Build Docker images
build_images() {
    print_status "Building Docker images..."
    
    # Build frontend image
    print_status "Building frontend image..."
    docker build -t service-mesh-playground/frontend:latest ./services/frontend/
    
    # Build API gateway image
    print_status "Building API gateway image..."
    docker build -t service-mesh-playground/api-gateway:latest ./services/api-gateway/
    
    # Build user service image
    print_status "Building user service image..."
    docker build -t service-mesh-playground/user-service:latest ./services/user-service/
    
    print_success "Docker images built successfully!"
}

# Deploy the application
deploy_application() {
    print_status "Deploying application..."
    
    # Create namespace
    kubectl apply -f k8s/base/namespace.yaml
    
    # Deploy base services
    kubectl apply -f k8s/base/
    
    # Wait for deployments to be ready
    print_status "Waiting for deployments to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/frontend -n service-mesh-playground
    kubectl wait --for=condition=available --timeout=300s deployment/api-gateway -n service-mesh-playground
    kubectl wait --for=condition=available --timeout=300s deployment/user-service -n service-mesh-playground
    
    print_success "Application deployed successfully!"
}

# Configure Istio
configure_istio() {
    print_status "Configuring Istio..."
    
    # Apply Istio configurations
    kubectl apply -f k8s/istio/
    
    # Wait for Istio configurations to be applied
    sleep 10
    
    print_success "Istio configured successfully!"
}

# Deploy monitoring stack
deploy_monitoring() {
    print_status "Deploying monitoring stack..."
    
    # Apply monitoring configurations
    kubectl apply -f k8s/monitoring/
    
    print_success "Monitoring stack deployed successfully!"
}

# Verify installation
verify_installation() {
    print_status "Verifying installation..."
    
    # Check if all pods are running
    kubectl get pods -n service-mesh-playground
    
    # Check if services are accessible
    print_status "Testing service connectivity..."
    
    # Test frontend health
    kubectl exec -it deployment/frontend -n service-mesh-playground -- curl -s http://localhost:3000/health
    
    # Test API gateway health
    kubectl exec -it deployment/api-gateway -n service-mesh-playground -- curl -s http://localhost:8080/health
    
    # Test user service health
    kubectl exec -it deployment/user-service -n service-mesh-playground -- curl -s http://localhost:3001/health
    
    print_success "Installation verified successfully!"
}

# Display access information
display_access_info() {
    print_success "🎉 Service Mesh Playground is ready!"
    echo ""
    echo "📋 Access Information:"
    echo "====================="
    echo ""
    echo "🌐 Frontend Application:"
    echo "   kubectl port-forward svc/frontend 3000:80 -n service-mesh-playground"
    echo "   Then open: http://localhost:3000"
    echo ""
    echo "📊 Prometheus Metrics:"
    echo "   kubectl port-forward svc/prometheus 9090:9090 -n service-mesh-playground"
    echo "   Then open: http://localhost:9090"
    echo ""
    echo "📈 Grafana Dashboards:"
    echo "   kubectl port-forward svc/grafana 3001:3000 -n service-mesh-playground"
    echo "   Then open: http://localhost:3001 (admin/admin)"
    echo ""
    echo "🔍 Jaeger Tracing:"
    echo "   kubectl port-forward svc/jaeger 16686:16686 -n service-mesh-playground"
    echo "   Then open: http://localhost:16686"
    echo ""
    echo "📚 Learning Scenarios:"
    echo "   Check the scenarios/ directory for hands-on exercises"
    echo ""
    echo "🛠️  Useful Commands:"
    echo "   kubectl get pods -n service-mesh-playground"
    echo "   kubectl get svc -n service-mesh-playground"
    echo "   kubectl get virtualservice -n service-mesh-playground"
    echo "   kubectl get destinationrule -n service-mesh-playground"
    echo ""
}

# Main execution
main() {
    echo "🏗️  Service Mesh Playground Setup"
    echo "=================================="
    echo ""
    
    check_prerequisites
    install_istio
    build_images
    deploy_application
    configure_istio
    deploy_monitoring
    verify_installation
    display_access_info
}

# Run main function
main "$@"
