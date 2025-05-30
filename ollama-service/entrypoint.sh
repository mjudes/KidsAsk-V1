#!/bin/bash
set -e

echo "Starting Ollama service..."

# Start the Ollama server in the background
echo "Starting Ollama server..."
ollama serve &

# Wait for the Ollama service to come up
echo "Waiting for Ollama service to start..."
sleep 10

# Pull the optimized model for kids questions
echo "Pulling llama2 model for kids questions..."
ollama pull llama2:7b || echo "Failed to pull model, continuing..."

# Create a custom model with kid-friendly settings
echo "Creating custom kids-friendly model..."
ollama create kidsai -f /app/config/kidsai-modelfile || echo "Failed to create custom model, continuing..."

# Keep the container running
echo "Ollama service is now running..."
tail -f /dev/null
