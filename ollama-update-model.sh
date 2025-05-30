#!/bin/bash
# Script to update Ollama AI models

echo "=========================================="
echo "Ollama AI Model Updater"
echo "=========================================="

# Check if Ollama service is running
if ! docker ps | grep -q "ollama-service"; then
  echo "❌ Ollama service is not running. Please start it with: docker compose up -d"
  exit 1
fi

# Get current models list
echo "Checking current models..."
CURRENT_MODELS=$(docker exec -it $(docker ps | grep ollama-service | awk '{print $1}') ollama list 2>/dev/null || echo "Error")

if [[ $CURRENT_MODELS == *"Error"* ]]; then
  echo "❌ Could not check Ollama models. Ollama service might not be fully initialized."
  exit 1
fi

echo -e "Current models:"
echo "$CURRENT_MODELS"

# Ask which model to update
echo -e "\nWhich model would you like to update/install?"
echo "Available options:"
echo "1) llama2:7b (Default - Good balance of performance and quality)"
echo "2) llama2:13b (Higher quality but requires more RAM)"
echo "3) mistral:7b (Alternative model with good performance)"
echo "4) phi:latest (Microsoft's small but capable model)"
echo "5) Recreate kidsai custom model"
echo "6) Exit"

read -p "Enter your choice (1-6): " MODEL_CHOICE

case $MODEL_CHOICE in
  1)
    MODEL="llama2:7b"
    ;;
  2)
    MODEL="llama2:13b"
    ;;
  3)
    MODEL="mistral:7b"
    ;;
  4)
    MODEL="phi:latest"
    ;;
  5)
    # Recreate kidsai model using the current modelfile
    echo -e "\nRecreating kidsai custom model..."
    docker exec -it $(docker ps | grep ollama-service | awk '{print $1}') ollama rm kidsai
    docker exec -it $(docker ps | grep ollama-service | awk '{print $1}') ollama create kidsai -f /app/config/kidsai-modelfile
    echo "✅ kidsai model has been recreated!"
    exit 0
    ;;
  6)
    echo "Exiting without changes."
    exit 0
    ;;
  *)
    echo "Invalid choice. Exiting."
    exit 1
    ;;
esac

# Pull the selected model
echo -e "\nPulling $MODEL..."
docker exec -it $(docker ps | grep ollama-service | awk '{print $1}') ollama pull $MODEL

if [ $? -ne 0 ]; then
  echo "❌ Failed to pull model $MODEL"
  exit 1
fi

echo "✅ Successfully pulled model $MODEL"

# Ask if user wants to update the base model for kidsai
read -p "Do you want to update the kidsai model to use $MODEL as the base? (y/n): " UPDATE_BASE

if [[ $UPDATE_BASE == "y" || $UPDATE_BASE == "Y" ]]; then
  # Update the modelfile
  sed -i.bak "s/FROM .*/FROM $MODEL/" /Users/meronj/meron-dev-projects/KidsAsk-V1/ollama-service/config/kidsai-modelfile
  
  # Recreate the kidsai model
  echo "Recreating kidsai model with new base..."
  docker exec -it $(docker ps | grep ollama-service | awk '{print $1}') ollama rm kidsai
  docker exec -it $(docker ps | grep ollama-service | awk '{print $1}') ollama create kidsai -f /app/config/kidsai-modelfile
  
  echo "✅ kidsai model has been updated to use $MODEL as base!"
  echo "You may need to restart the services to apply all changes:"
  echo "docker compose restart ollama-service ollama-api"
else
  echo "kidsai model remains unchanged."
fi

echo -e "\n=========================================="
echo "Model update completed"
echo "=========================================="
