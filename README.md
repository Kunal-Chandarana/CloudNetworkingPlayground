# Cloud Networking Playground - Service Mesh with Istio & Envoy

A comprehensive learning playground for understanding cloud networking concepts through service mesh implementation using Istio and Envoy proxy.

## 🏗️ Architecture Overview

This playground simulates a realistic microservices e-commerce application with the following components:

### Core Services
- **Frontend** - React-based web application
- **API Gateway** - Entry point for all client requests
- **User Service** - User management and authentication
- **Product Service** - Product catalog and inventory
- **Order Service** - Order processing and management
- **Payment Service** - Payment processing
- **Notification Service** - Email/SMS notifications
- **Database Services** - PostgreSQL, Redis

### Service Mesh Components
- **Istio Control Plane** - Traffic management, security, observability
- **Envoy Sidecar Proxies** - Data plane for each service
- **Istio Gateway** - Ingress/egress traffic management
- **Virtual Services** - Traffic routing rules
- **Destination Rules** - Load balancing and connection pooling
- **Service Entries** - External service integration

## 🎯 Learning Objectives

### 1. Service Mesh Fundamentals
- Understanding sidecar proxy pattern
- Service discovery and registration
- Automatic mTLS between services
- Traffic interception and routing

### 2. Traffic Management
- **Canary Deployments** - Gradual traffic shifting
- **A/B Testing** - Traffic splitting based on headers
- **Circuit Breakers** - Fault tolerance patterns
- **Load Balancing** - Round-robin, least connections, etc.
- **Retry Policies** - Automatic retry with backoff

### 3. Security
- **mTLS** - Mutual TLS between services
- **Authorization Policies** - RBAC for service access
- **Rate Limiting** - Request throttling
- **JWT Authentication** - Token-based auth
- **Network Policies** - Kubernetes network segmentation

### 4. Observability
- **Distributed Tracing** - Request flow across services
- **Metrics Collection** - Prometheus integration
- **Logging** - Centralized log aggregation
- **Service Topology** - Visual service dependencies
- **Performance Monitoring** - Latency, throughput, error rates

### 5. Advanced Scenarios
- **Multi-cluster Communication** - Cross-cluster service mesh
- **External Service Integration** - Service entries for APIs
- **Fault Injection** - Chaos engineering practices
- **Configuration Management** - Dynamic config updates

## 🚀 Getting Started

### Prerequisites
- Kubernetes cluster (minikube, kind, or cloud provider)
- kubectl configured
- Istio installed
- Docker for building images

### Quick Start
```bash
# 1. Install Istio
istioctl install --set values.defaultRevision=default

# 2. Enable automatic sidecar injection
kubectl label namespace default istio-injection=enabled

# 3. Deploy the application
kubectl apply -f k8s/

# 4. Access the application
kubectl port-forward svc/frontend 3000:80
```

## 📁 Project Structure

```
├── services/                 # Microservices source code
│   ├── frontend/            # React web application
│   ├── api-gateway/         # API gateway service
│   ├── user-service/        # User management
│   ├── product-service/     # Product catalog
│   ├── order-service/       # Order processing
│   ├── payment-service/     # Payment processing
│   └── notification-service/ # Notifications
├── k8s/                     # Kubernetes manifests
│   ├── base/               # Base application manifests
│   ├── istio/              # Istio configuration
│   └── monitoring/         # Observability stack
├── scenarios/              # Learning scenarios
│   ├── traffic-management/ # Traffic routing exercises
│   ├── security/          # Security policy exercises
│   ├── observability/     # Monitoring exercises
│   └── resilience/        # Fault tolerance exercises
├── docs/                   # Documentation
│   ├── concepts/          # Service mesh concepts
│   ├── tutorials/         # Step-by-step tutorials
│   └── troubleshooting/   # Common issues and solutions
└── scripts/               # Automation scripts
    ├── setup.sh          # Environment setup
    ├── deploy.sh         # Deployment automation
    └── cleanup.sh        # Environment cleanup
```

## 🎓 Learning Path

### Phase 1: Foundation (Week 1-2)
1. **Setup Environment** - Install Istio, deploy basic services
2. **Service Communication** - Understand sidecar injection
3. **Basic Traffic Management** - Virtual services and destination rules
4. **Observability Basics** - Access logs, metrics, and traces

### Phase 2: Traffic Management (Week 3-4)
1. **Canary Deployments** - Gradual traffic shifting
2. **A/B Testing** - Header-based routing
3. **Load Balancing** - Different algorithms and policies
4. **Circuit Breakers** - Fault tolerance implementation

### Phase 3: Security (Week 5-6)
1. **mTLS Configuration** - Automatic and manual TLS
2. **Authorization Policies** - Service-to-service access control
3. **Rate Limiting** - Request throttling policies
4. **JWT Authentication** - Token-based security

### Phase 4: Advanced Topics (Week 7-8)
1. **Multi-cluster Setup** - Cross-cluster communication
2. **External Services** - Service entries and egress
3. **Fault Injection** - Chaos engineering
4. **Performance Optimization** - Tuning and best practices

## 🛠️ Hands-on Exercises

### Exercise 1: Basic Service Mesh
- Deploy microservices with automatic sidecar injection
- Observe traffic flow through Envoy proxies
- Analyze service topology and dependencies

### Exercise 2: Canary Deployment
- Deploy new version of a service
- Gradually shift traffic from old to new version
- Monitor metrics and rollback if needed

### Exercise 3: Security Implementation
- Enable mTLS between services
- Implement authorization policies
- Test service access restrictions

### Exercise 4: Observability
- Set up distributed tracing
- Create custom dashboards
- Implement alerting rules

## 📊 Monitoring & Observability

### Metrics Dashboard
- Service performance metrics
- Error rates and latency
- Resource utilization
- Traffic patterns

### Distributed Tracing
- Request flow visualization
- Service dependency mapping
- Performance bottleneck identification
- Error propagation tracking

### Logging
- Centralized log aggregation
- Structured logging
- Log correlation with traces
- Error analysis and debugging

## 🔧 Troubleshooting

### Common Issues
- Sidecar injection failures
- Traffic routing problems
- mTLS certificate issues
- Performance degradation

### Debugging Tools
- Istioctl analyze
- Envoy admin interface
- Prometheus queries
- Jaeger trace analysis

## 📚 Additional Resources

- [Istio Documentation](https://istio.io/latest/docs/)
- [Envoy Proxy Documentation](https://www.envoyproxy.io/docs/)
- [Service Mesh Patterns](https://www.servicemeshpatterns.com/)
- [Cloud Native Computing Foundation](https://www.cncf.io/)

## 🤝 Contributing

This playground is designed for learning and experimentation. Feel free to:
- Add new scenarios and exercises
- Improve documentation
- Fix bugs and issues
- Share your learning experiences

## 📄 License

MIT License - Feel free to use this playground for learning and experimentation.