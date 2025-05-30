#!/bin/bash
# Test script for Ollama AI integration

echo "====================================="
echo "KidsAsk Ollama AI Integration Test"
echo "====================================="

# Test if containers are running
echo "Checking if containers are running..."
if ! docker ps | grep -q "ollama-service"; then
  echo "❌ Ollama service is not running. Please start it with: docker compose up -d"
  exit 1
fi

if ! docker ps | grep -q "ollama-api"; then
  echo "❌ Ollama API service is not running. Please start it with: docker compose up -d"
  exit 1
fi

echo "✅ Ollama containers are running"

# Wait for services to fully initialize
echo -e "\nWaiting for services to initialize..."
sleep 5

# Test the Ollama API directly
echo -e "\nTesting Ollama API health endpoint..."
HEALTH_RESPONSE=$(curl -s -m 5 http://localhost:5050/health)
if [[ $HEALTH_RESPONSE == *"ok"* ]]; then
  echo "✅ Ollama API health check successful"
else
  echo "❌ Ollama API health check failed. Response: $HEALTH_RESPONSE"
  exit 1
fi

# Test with a simple question
echo -e "\nTesting AI response generation..."
echo "Question: Why is the sky blue?"
echo "Topic: Weather and Natural Phenomena"

RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"message":"Why is the sky blue?","topic":"Weather and Natural Phenomena","history":[]}' \
  http://localhost:5050/generate)

if [[ $RESPONSE == *"response"* ]]; then
  echo -e "\n✅ Successfully received AI response:"
  echo -e "\n-----------------------------------"
  echo $RESPONSE | sed 's/.*"response":"\([^"]*\)".*/\1/'
  echo -e "-----------------------------------"
  echo -e "\nOllama AI integration is working properly!"
else
  echo "❌ Failed to get AI response. Raw response:"
  echo $RESPONSE
  exit 1
fi

echo -e "\n====================================="
echo "All tests completed successfully!"
echo "====================================="
exit 0
