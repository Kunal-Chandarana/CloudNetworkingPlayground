# mTLS Implementation Scenario

## Objective
Learn how to implement mutual TLS (mTLS) between services using Istio's security features.

## Prerequisites
- Istio installed and configured
- Service mesh playground deployed
- kubectl configured

## Scenario Overview
Enable mTLS between all services in the mesh and observe the security benefits.

## Step 1: Understand Current State

### 1.1 Check Current mTLS Configuration
```bash
# Check current peer authentication
kubectl get peerauthentication -n service-mesh-playground

# Check if mTLS is enabled
kubectl get peerauthentication default -n service-mesh-playground -o yaml
```

### 1.2 Test Service Communication
```bash
# Test communication between services
kubectl exec -it deployment/api-gateway -n service-mesh-playground -- curl http://user-service:3001/health

# Check if traffic is encrypted
kubectl logs -l app=api-gateway -n service-mesh-playground | grep -i tls
```

## Step 2: Enable Strict mTLS

### 2.1 Apply Strict mTLS Policy
```bash
kubectl apply -f - <<EOF
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: service-mesh-playground
spec:
  mtls:
    mode: STRICT
EOF
```

### 2.2 Verify mTLS is Enabled
```bash
# Check peer authentication
kubectl get peerauthentication default -n service-mesh-playground -o yaml

# Test service communication (should still work)
kubectl exec -it deployment/api-gateway -n service-mesh-playground -- curl http://user-service:3001/health
```

## Step 3: Test mTLS Security

### 3.1 Deploy a Service Outside the Mesh
```bash
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: external-service
  namespace: service-mesh-playground
  labels:
    app: external-service
spec:
  replicas: 1
  selector:
    matchLabels:
      app: external-service
  template:
    metadata:
      labels:
        app: external-service
    spec:
      containers:
      - name: external-service
        image: nginx:alpine
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: external-service
  namespace: service-mesh-playground
spec:
  selector:
    app: external-service
  ports:
  - port: 80
    targetPort: 80
EOF
```

### 3.2 Test Communication with External Service
```bash
# This should fail due to mTLS requirements
kubectl exec -it deployment/api-gateway -n service-mesh-playground -- curl http://external-service:80
```

## Step 4: Configure Authorization Policies

### 4.1 Create Authorization Policy
```bash
kubectl apply -f - <<EOF
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: service-mesh-authz
  namespace: service-mesh-playground
spec:
  rules:
  # Allow frontend to access API gateway
  - from:
    - source:
        principals: ["cluster.local/ns/service-mesh-playground/sa/frontend"]
    to:
    - operation:
        methods: ["GET", "POST"]
        paths: ["/api/*"]
  # Allow API gateway to access all services
  - from:
    - source:
        principals: ["cluster.local/ns/service-mesh-playground/sa/api-gateway"]
    to:
    - operation:
        methods: ["GET", "POST", "PUT", "DELETE"]
  # Allow health checks
  - from:
    - source:
        principals: ["cluster.local/ns/istio-system/sa/istio-ingressgateway-service-account"]
    to:
    - operation:
        paths: ["/health"]
EOF
```

### 4.2 Test Authorization
```bash
# Test allowed communication
kubectl exec -it deployment/frontend -n service-mesh-playground -- curl http://api-gateway:8080/health

# Test blocked communication (should fail)
kubectl exec -it deployment/user-service -n service-mesh-playground -- curl http://api-gateway:8080/api/products
```

## Step 5: Monitor Security Metrics

### 5.1 Check Security Metrics
```bash
# Port forward to Prometheus
kubectl port-forward svc/prometheus 9090:9090 -n service-mesh-playground

# Query security metrics
# istio_tcp_connections_opened_total
# istio_tcp_connections_closed_total
# istio_request_duration_milliseconds
```

### 5.2 View Security Dashboard
```bash
# Port forward to Grafana
kubectl port-forward svc/grafana 3000:3000 -n service-mesh-playground

# Open http://localhost:3000
# Username: admin, Password: admin
# Navigate to Service Mesh Security dashboard
```

## Step 6: Advanced Security Scenarios

### 6.1 JWT Authentication
```bash
kubectl apply -f - <<EOF
apiVersion: security.istio.io/v1beta1
kind: RequestAuthentication
metadata:
  name: jwt-auth
  namespace: service-mesh-playground
spec:
  selector:
    matchLabels:
      app: api-gateway
  jwtRules:
  - issuer: "https://your-auth-server.com"
    jwksUri: "https://your-auth-server.com/.well-known/jwks.json"
---
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: jwt-authz
  namespace: service-mesh-playground
spec:
  selector:
    matchLabels:
      app: api-gateway
  rules:
  - from:
    - source:
        requestPrincipals: ["*"]
    to:
    - operation:
        methods: ["GET", "POST"]
EOF
```

### 6.2 Rate Limiting
```bash
kubectl apply -f - <<EOF
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: rate-limit-policy
  namespace: service-mesh-playground
spec:
  rules:
  - to:
    - operation:
        methods: ["GET", "POST"]
    when:
    - key: source.ip
      values: ["*"]
    # This will be enforced by Envoy's rate limiting
EOF
```

## Learning Outcomes

After completing this scenario, you will understand:

1. **mTLS Implementation**: How to enable mutual TLS between services
2. **Security Policies**: How to configure authorization policies
3. **Service Identity**: How Istio manages service identities
4. **Traffic Encryption**: How all traffic is encrypted in transit
5. **Access Control**: How to restrict service-to-service communication

## Key Concepts

- **Peer Authentication**: Configuring mTLS between services
- **Authorization Policies**: Controlling access between services
- **Service Principals**: Identity-based access control
- **JWT Authentication**: Token-based authentication
- **Rate Limiting**: Request throttling and protection

## Troubleshooting

### Common Issues
1. **mTLS not working**: Check peer authentication configuration
2. **Authorization denied**: Verify service principals and policies
3. **Certificate issues**: Check Istio certificate management

### Debug Commands
```bash
# Check peer authentication
kubectl get peerauthentication -n service-mesh-playground

# Check authorization policies
kubectl get authorizationpolicy -n service-mesh-playground

# Check service accounts
kubectl get serviceaccounts -n service-mesh-playground

# Check Istio certificates
kubectl exec -it deployment/api-gateway -n service-mesh-playground -- ls /etc/certs/
```

## Security Best Practices

1. **Always use STRICT mTLS** in production environments
2. **Implement least privilege** authorization policies
3. **Regular certificate rotation** for enhanced security
4. **Monitor security metrics** for anomalies
5. **Use JWT tokens** for user authentication
6. **Implement rate limiting** to prevent abuse
