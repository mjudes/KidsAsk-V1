#!/bin/bash
# Docker container health check script for KidsAsk

echo "=========================================="
echo "KidsAsk Container Health Check"
echo "=========================================="

# Check if all services are up
echo "Checking service status..."
SERVICES=("frontend" "api" "database" "ollama-service" "ollama-api")
ALL_RUNNING=true

for SERVICE in "${SERVICES[@]}"; do
  if docker ps | grep -q "kidsask-v1_${SERVICE}"; then
    echo "✅ $SERVICE is running"
  else
    echo "❌ $SERVICE is not running"
    ALL_RUNNING=false
  fi
done

if [ "$ALL_RUNNING" = false ]; then
  echo -e "\n⚠️ Some services are not running. You can start them with:"
  echo "   ./start.sh or ./start-dev.sh"
else
  echo -e "\n✅ All services are running properly"
fi

# Check if Ollama model is loaded
echo -e "\nChecking Ollama model status..."
OLLAMA_TAGS=$(docker exec -it $(docker ps | grep ollama-service | awk '{print $1}') ollama list 2>/dev/null || echo "Error")

if [[ $OLLAMA_TAGS == *"Error"* ]]; then
  echo "❌ Could not check Ollama models. Ollama service might not be fully initialized."
elif [[ $OLLAMA_TAGS == *"kidsai"* ]]; then
  echo "✅ KidsAI model is loaded"
else
  echo "⚠️ KidsAI model is not loaded yet. It will be created on first use."
fi

# Check resource usage
echo -e "\nChecking container resource usage..."
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Check for container logs with errors
echo -e "\nChecking for error logs in containers..."
ERROR_COUNT=0

for SERVICE in "${SERVICES[@]}"; do
  SERVICE_ERRORS=$(docker logs $(docker ps | grep "kidsask-v1_${SERVICE}" | awk '{print $1}') 2>&1 | grep -i "error" | wc -l)
  if [ $SERVICE_ERRORS -gt 0 ]; then
    echo "⚠️ $SERVICE has $SERVICE_ERRORS error messages in logs"
    ERROR_COUNT=$((ERROR_COUNT + SERVICE_ERRORS))
  else
    echo "✅ No errors found in $SERVICE logs"
  fi
done

if [ $ERROR_COUNT -gt 0 ]; then
  echo -e "\n⚠️ Found $ERROR_COUNT error messages across all services."
  echo "   You can view detailed logs with: docker logs [container_name]"
else
  echo -e "\n✅ No errors found in container logs"
fi

echo -e "\n=========================================="
echo "Health check completed"
echo "=========================================="
