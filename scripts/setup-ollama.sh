#!/bin/bash
# filepath: /Users/meronj/meron-dev-projects/KidsAsk-V1/setup-ollama.sh

# This script pulls Ollama models needed for the KidsAsk application

echo "Setting up Ollama models for KidsAsk..."

# Check if Ollama service is running
echo "Checking if Ollama service is running..."
if ! curl -s --head http://localhost:11434/api/tags > /dev/null; then
    echo "Error: Ollama service is not running. Please start the Ollama service first."
    echo "You can start it by running: docker-compose up -d ollama"
    exit 1
fi

# Pull required models
echo "Pulling Gemma 2B model..."
ollama pull gemma:2b

echo "Pulling Llama2 7B model as fallback..."
ollama pull llama2:7b

echo "Setup complete! KidsAsk is now configured to use Ollama models."
echo ""
echo "You can test the models with the CLI tool:"
echo "python ai-service/src/cli.py \"how many years can a beagle dog live?\""
echo ""
echo "Or use ollama directly:"
echo "ollama run gemma:2b \"how many years can a beagle dog live?\""
