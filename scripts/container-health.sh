#!/bin/bash

# Health check script for KidsAsk-V1 containers
# This script checks all containers and attempts to restore them if they're down

echo "Running KidsAsk-V1 Container Health Check"
echo "========================================"

# Function to check if a container exists and is running
check_container() {
  local container_name=$1
  local container_id=$(docker ps -q -f name=$container_name)
  
  if [ -z "$container_id" ]; then
    echo "❌ $container_name is not running"
    
    # Check if container exists but is stopped
    local stopped_id=$(docker ps -a -q -f name=$container_name)
    if [ -n "$stopped_id" ]; then
      echo "   Attempting to restart $container_name..."
      docker start $container_name
      sleep 3
      
      # Check if restart was successful
      if [ -n "$(docker ps -q -f name=$container_name)" ]; then
        echo "✅ Successfully restarted $container_name"
        return 0
      else
        echo "❌ Failed to restart $container_name"
        return 1
      fi
    else
      echo "❌ Container $container_name does not exist"
      return 1
    fi
  else
    echo "✅ $container_name is running"
    return 0
  fi
}

# Function to check API health
check_api_health() {
  echo "Checking API health..."
  
  local response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/health 2>/dev/null)
  
  if [ "$response" == "200" ]; then
    echo "✅ API is responding correctly"
    return 0
  else
    echo "❌ API is not responding correctly (HTTP $response)"
    return 1
  fi
}

# Function to check AI service health
check_ai_health() {
  echo "Checking AI service health..."
  
  local response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5050/health 2>/dev/null)
  
  if [ "$response" == "200" ]; then
    echo "✅ AI service is responding correctly"
    
    # Get more detailed health info
    local health_info=$(curl -s http://localhost:5050/health)
    echo "   AI service details: $health_info"
    return 0
  else
    echo "❌ AI service is not responding correctly (HTTP $response)"
    return 1
  fi
}

# Function to check Ollama health
check_ollama_health() {
  echo "Checking Ollama service health..."
  
  local response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:11434/api/tags 2>/dev/null)
  
  if [ "$response" == "200" ]; then
    echo "✅ Ollama service is responding correctly"
    
    # Check if TinyLlama model is available
    if curl -s http://localhost:11434/api/tags | grep -q "tinyllama"; then
      echo "✅ TinyLlama model is available"
      return 0
    else
      echo "❌ TinyLlama model is not available"
      echo "   Attempting to pull TinyLlama model..."
      curl -X POST http://localhost:11434/api/pull -d '{"name": "tinyllama:latest"}'
      return 1
    fi
  else
    echo "❌ Ollama service is not responding correctly (HTTP $response)"
    return 1
  fi
}

# Check all containers
echo "Checking container status..."
check_container "kidsask-v1-frontend-1"
check_container "kidsask-v1-api-1"
check_container "kidsask-v1-ai-service-1"
check_container "kidsask-v1-ollama-1"
check_container "kidsask-v1-database-1"

# Check service health
echo -e "\nChecking service health..."
check_api_health
check_ai_health
check_ollama_health

# Perform a simple test query
echo -e "\nTesting AI response with a simple question..."
curl -s -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is your name?", "topicId":1}' | jq .

echo -e "\nHealth check complete"