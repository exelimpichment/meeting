#!/bin/bash
# Load local secrets (NOT committed to GitHub)
ENV_FILE="k8s/minicube/secrets/.env.local"
if [ -f "$ENV_FILE" ]; then
  export $(cat "$ENV_FILE" | grep -v '#' | xargs)
else
  echo "ERROR: .env.local not found at $ENV_FILE"
  exit 1
fi

# Create namespace
echo "Creating namespace..."
kubectl apply -f k8s/minicube/meeting-app-namespace.yaml

# Deploy secrets with substituted values
echo "Deploying secrets..."
envsubst < k8s/minicube/secrets/meeting-api-gateway-secrets.yaml | kubectl apply -f -

# Deploy database service
echo "Deploying database service..."
kubectl apply -f k8s/minicube/database/auth-db-service.yaml

# Deploy meeting-api-gateway
echo "Deploying meeting-api-gateway..."
kubectl apply -f k8s/minicube/meeting-api-gateway/

# Deploy NATS
echo "Deploying NATS..."
kubectl apply -f minikube/nats/

echo "Deployment complete!"
echo "Run 'minikube tunnel' in another terminal for LoadBalancer access"
