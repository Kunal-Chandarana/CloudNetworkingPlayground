#!/bin/bash

# Service Mesh Playground Deployment Script
# This script deploys the service mesh playground to a Kubernetes cluster

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

# Function to deploy with retry
deploy_with_retry() {
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        print_status "Deployment attempt $attempt of $max_attempts..."
        
        if kubectl apply -f "$1"; then
            print_success "Successfully deployed $1"
            return 0
        else
            print_warning "Failed to deploy $1 (attempt $attempt)"
            if [ $attempt -eq $max_attempts ]; then
                print_error "Failed to deploy $1 after $max_attempts attempts"
                return 1
            fi
            sleep 5
            ((attempt++))
        fi
    done
}

# Deploy base application
deploy_base() {
    print_status "Deploying base application..."
    
    # Create namespace first
    kubectl apply -f k8s/base/namespace.yaml
    
    # Deploy all base services
    for file in k8s/base/*.yaml; do
        if [ -f "$file" ] && [ "$(basename "$file")" != "namespace.yaml" ]; then
            deploy_with_retry "$file"
        fi
    done
    
    print_success "Base application deployed!"
}

# Deploy Istio configuration
deploy_istio() {
    print_status "Deploying Istio configuration..."
    
    for file in k8s/istio/*.yaml; do
        if [ -f "$file" ]; then
            deploy_with_retry "$file"
        fi
    done
    
    print_success "Istio configuration deployed!"
}

# Deploy monitoring
deploy_monitoring() {
    print_status "Deploying monitoring stack..."
    
    for file in k8s/monitoring/*.yaml; do
        if [ -f "$file" ]; then
            deploy_with_retry "$file"
        fi
    done
    
    print_success "Monitoring stack deployed!"
}

# Wait for deployments
wait_for_deployments() {
    print_status "Waiting for deployments to be ready..."
    
    local deployments=("frontend" "api-gateway" "user-service")
    
    for deployment in "${deployments[@]}"; do
        print_status "Waiting for $deployment deployment..."
        kubectl wait --for=condition=available --timeout=300s "deployment/$deployment" -n service-mesh-playground
    done
    
    print_success "All deployments are ready!"
}

# Verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Check pod status
    print_status "Checking pod status..."
    kubectl get pods -n service-mesh-playground
    
    # Check service status
    print_status "Checking service status..."
    kubectl get svc -n service-mesh-playground
    
    # Check Istio resources
    print_status "Checking Istio resources..."
    kubectl get virtualservice -n service-mesh-playground
    kubectl get destinationrule -n service-mesh-playground
    
    print_success "Deployment verification completed!"
}

# Main deployment function
main() {
    echo "🚀 Service Mesh Playground Deployment"
    echo "====================================="
    echo ""
    
    deploy_base
    deploy_istio
    deploy_monitoring
    wait_for_deployments
    verify_deployment
    
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Next Steps:"
    echo "=============="
    echo "1. Access the frontend: kubectl port-forward svc/frontend 3000:80 -n service-mesh-playground"
    echo "2. Check scenarios/ directory for learning exercises"
    echo "3. Monitor with: kubectl port-forward svc/prometheus 9090:9090 -n service-mesh-playground"
    echo ""
}

# Run main function
main "$@"
