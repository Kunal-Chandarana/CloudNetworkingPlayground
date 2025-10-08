# Canary Deployment Scenario

## Objective
Learn how to implement canary deployments using Istio's traffic management capabilities.

## Prerequisites
- Istio installed and configured
- Service mesh playground deployed
- kubectl configured

## Scenario Overview
Deploy a new version of the user service and gradually shift traffic from the old version to the new version.

## Step 1: Deploy New Version

### 1.1 Create User Service v2
```bash
# Create a new deployment with version v2
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service-v2
  namespace: service-mesh-playground
  labels:
    app: user-service
    version: v2
spec:
  replicas: 1
  selector:
    matchLabels:
      app: user-service
      version: v2
  template:
    metadata:
      labels:
        app: user-service
        version: v2
    spec:
      containers:
      - name: user-service
        image: service-mesh-playground/user-service:v2
        ports:
        - containerPort: 3001
        env:
        - name: SERVICE_VERSION
          value: "v2"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
EOF
```

### 1.2 Update Destination Rule
```bash
kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: user-service-dr
  namespace: service-mesh-playground
spec:
  host: user-service
  subsets:
  - name: v1
    labels:
      version: v1
  - name: v2
    labels:
      version: v2
  trafficPolicy:
    loadBalancer:
      simple: LEAST_CONN
EOF
```

## Step 2: Implement Canary Deployment

### 2.1 Start with 10% Traffic to v2
```bash
kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: user-service-vs
  namespace: service-mesh-playground
spec:
  hosts:
  - user-service
  http:
  - route:
    - destination:
        host: user-service
        subset: v1
        port:
          number: 3001
      weight: 90
    - destination:
        host: user-service
        subset: v2
        port:
          number: 3001
      weight: 10
    timeout: 30s
    retries:
      attempts: 3
      perTryTimeout: 10s
EOF
```

### 2.2 Monitor the Deployment
```bash
# Check traffic distribution
kubectl exec -it deployment/api-gateway -n service-mesh-playground -- curl http://user-service:3001/health

# Monitor metrics
kubectl port-forward svc/prometheus 9090:9090 -n service-mesh-playground
# Open http://localhost:9090 and query: rate(istio_requests_total[5m])
```

### 2.3 Gradually Increase Traffic
```bash
# 25% traffic to v2
kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: user-service-vs
  namespace: service-mesh-playground
spec:
  hosts:
  - user-service
  http:
  - route:
    - destination:
        host: user-service
        subset: v1
        port:
          number: 3001
      weight: 75
    - destination:
        host: user-service
        subset: v2
        port:
          number: 3001
      weight: 25
EOF
```

### 2.4 Complete the Migration
```bash
# 100% traffic to v2
kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: user-service-vs
  namespace: service-mesh-playground
spec:
  hosts:
  - user-service
  http:
  - route:
    - destination:
        host: user-service
        subset: v2
        port:
          number: 3001
      weight: 100
EOF
```

## Step 3: Rollback Scenario

### 3.1 Simulate Issues with v2
```bash
# Deploy a faulty version
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service-v2-faulty
  namespace: service-mesh-playground
  labels:
    app: user-service
    version: v2-faulty
spec:
  replicas: 1
  selector:
    matchLabels:
      app: user-service
      version: v2-faulty
  template:
    metadata:
      labels:
        app: user-service
        version: v2-faulty
    spec:
      containers:
      - name: user-service
        image: service-mesh-playground/user-service:v2-faulty
        ports:
        - containerPort: 3001
        env:
        - name: SERVICE_VERSION
          value: "v2-faulty"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
EOF
```

### 3.2 Quick Rollback
```bash
# Immediately rollback to v1
kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: user-service-vs
  namespace: service-mesh-playground
spec:
  hosts:
  - user-service
  http:
  - route:
    - destination:
        host: user-service
        subset: v1
        port:
          number: 3001
      weight: 100
EOF
```

## Learning Outcomes

After completing this scenario, you will understand:

1. **Traffic Splitting**: How to gradually shift traffic between service versions
2. **Risk Mitigation**: How canary deployments reduce deployment risks
3. **Monitoring**: How to monitor the health of different service versions
4. **Rollback Strategies**: How to quickly rollback problematic deployments
5. **Istio Virtual Services**: How to configure traffic routing rules

## Key Concepts

- **Weighted Routing**: Distributing traffic based on percentages
- **Subset Management**: Organizing service versions into subsets
- **Health Monitoring**: Observing service health during deployments
- **Gradual Rollout**: Reducing risk through incremental traffic shifts

## Troubleshooting

### Common Issues
1. **Traffic not splitting**: Check destination rule subsets
2. **Service not responding**: Verify pod labels match subset labels
3. **Metrics not showing**: Ensure Prometheus is scraping Istio metrics

### Debug Commands
```bash
# Check virtual service configuration
kubectl get virtualservice user-service-vs -n service-mesh-playground -o yaml

# Check destination rule
kubectl get destinationrule user-service-dr -n service-mesh-playground -o yaml

# Check pod labels
kubectl get pods -n service-mesh-playground --show-labels

# Check service endpoints
kubectl get endpoints user-service -n service-mesh-playground
```
