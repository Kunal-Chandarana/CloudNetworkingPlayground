#!/bin/bash

# Build Docker Images for Service Mesh Playground
# This script builds all the required Docker images

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

echo "🐳 Building Docker Images for Service Mesh Playground"
echo "====================================================="
echo ""

# Check if Docker is running
if ! docker ps &> /dev/null; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Build frontend image
print_status "Building frontend image..."
if docker build -t service-mesh-playground/frontend:latest ./services/frontend/; then
    print_success "Frontend image built successfully!"
else
    print_error "Failed to build frontend image"
    exit 1
fi

# Build API gateway image
print_status "Building API gateway image..."
if docker build -t service-mesh-playground/api-gateway:latest ./services/api-gateway/; then
    print_success "API gateway image built successfully!"
else
    print_error "Failed to build API gateway image"
    exit 1
fi

# Build user service image
print_status "Building user service image..."
if docker build -t service-mesh-playground/user-service:latest ./services/user-service/; then
    print_success "User service image built successfully!"
else
    print_error "Failed to build user service image"
    exit 1
fi

print_success "🎉 All Docker images built successfully!"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo "1. Update deployments to use local images:"
echo "   kubectl set image deployment/frontend frontend=service-mesh-playground/frontend:latest -n service-mesh-playground"
echo "   kubectl set image deployment/api-gateway api-gateway=service-mesh-playground/api-gateway:latest -n service-mesh-playground"
echo "   kubectl set image deployment/user-service user-service=service-mesh-playground/user-service:latest -n service-mesh-playground"
echo ""
echo "2. Wait for deployments to be ready:"
echo "   kubectl rollout status deployment/frontend -n service-mesh-playground"
echo "   kubectl rollout status deployment/api-gateway -n service-mesh-playground"
echo "   kubectl rollout status deployment/user-service -n service-mesh-playground"
echo ""
echo "3. Check pod status:"
echo "   kubectl get pods -n service-mesh-playground"
echo ""
