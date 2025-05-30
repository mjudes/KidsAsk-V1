#!/bin/bash
# Ollama health check script for KidsAsk

echo "==========================================="
echo "Ollama Health Check and Optimization Script"
echo "==========================================="

# Check if Ollama service is accessible
echo "Checking Ollama service connectivity..."
if curl -s -m 5 http://localhost:11434/api/tags > /dev/null; then
  echo "✅ Ollama service is running and accessible"
else
  echo "❌ Ollama service is not accessible. Please check if the container is running."
  echo "   You can start it with: docker compose up -d ollama-service"
  exit 1
fi

# Check available models
echo -e "\nChecking available models..."
MODELS=$(curl -s http://localhost:11434/api/tags)
if echo $MODELS | grep -q "kidsai"; then
  echo "✅ Kids AI model is available"
else
  echo "⚠️ Kids AI model not found. It will be created on first run."
fi

# Check Ollama API service
echo -e "\nChecking Ollama API service..."
if curl -s -m 5 http://localhost:5050/health > /dev/null; then
  echo "✅ Ollama API service is running and accessible"
else
  echo "❌ Ollama API service is not accessible. Please check if the container is running."
  echo "   You can start it with: docker compose up -d ollama-api"
  exit 1
fi

# Print optimization info
echo -e "\n==========================================="
echo "Ollama Performance Optimization Info"
echo "==========================================="
echo "Current Ollama settings:"
echo " - Number of threads: 4"
echo " - GPU layers: 1 (if supported by your MacBook Pro)"
echo " - Context size: 2048 tokens"
echo " - Temperature: 0.7 (balanced creativity)"
echo -e "\nTo adjust these settings for better performance:"
echo "1. Edit the Docker environment variables in docker-compose.yml"
echo "2. Edit the modelfile at ollama-service/config/kidsai-modelfile"
echo "3. Restart the services with: docker compose restart ollama-service ollama-api"
echo -e "\nOptimal settings depend on your specific MacBook Pro model."
echo "For newer M1/M2 MacBooks, you can increase threads to 8."
echo "==========================================="

exit 0
