#!/bin/bash

# Ollama Health Check Script for KidsAsk-V1
# This script checks Ollama service health and performs maintenance operations

echo "Running Ollama Health Check"
echo "=========================="

# Check if Ollama service is running
if ! curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "❌ Ollama service is not responding"
    exit 1
fi

echo "✅ Ollama service is running"

# Get available models
MODELS=$(curl -s http://localhost:11434/api/tags)

# Check if TinyLlama model is available
if ! echo "$MODELS" | grep -q "tinyllama"; then
    echo "❌ TinyLlama model is not available"
    echo "Pulling TinyLlama model..."
    curl -X POST http://localhost:11434/api/pull -d '{"name": "tinyllama:latest"}'
else
    echo "✅ TinyLlama model is available"
fi

# Check if llama2:7b model is available (as fallback)
if ! echo "$MODELS" | grep -q "llama2:7b"; then
    echo "❌ Llama2 7B model is not available"
    echo "Pulling Llama2 7B model..."
    curl -X POST http://localhost:11434/api/pull -d '{"name": "llama2:7b"}'
else
    echo "✅ Llama2 7B model is available"
fi

# Send a simple warmup request to ensure the model is ready
echo "Warming up the model..."
curl -s -X POST http://localhost:11434/api/generate -d '{
    "model": "tinyllama:latest",
    "prompt": "Hello, are you working?",
    "stream": false,
    "options": {
        "num_predict": 50
    }
}' | jq -r '.response'

echo -e "\nOllama health check complete"