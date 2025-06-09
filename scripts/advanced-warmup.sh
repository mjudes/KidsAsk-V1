#!/bin/bash

# Advanced model optimization script for KidsAsk-V1
# This script performs more extensive warmup and tuning for Ollama models

echo "Starting advanced Ollama model optimization..."

# Wait for Ollama service to be ready
echo "Waiting for Ollama service to be available..."
until curl -s http://localhost:11434/api/tags >/dev/null; do
    echo "Waiting for Ollama service..."
    sleep 2
done

# Check if the Phi model exists and pull if not (much smaller model)
if ! curl -s http://localhost:11434/api/tags | grep -q "phi:latest"; then
    echo "Pulling Phi model (smaller and faster)..."
    curl -X POST http://localhost:11434/api/pull -d '{"name": "phi:latest"}'
fi

# Check if the Orca Mini model exists and pull if not (backup model)
if ! curl -s http://localhost:11434/api/tags | grep -q "orca-mini:latest"; then
    echo "Pulling Orca Mini model (backup)..."
    curl -X POST http://localhost:11434/api/pull -d '{"name": "orca-mini:latest"}'
fi

# Set minimal model parameters for lower memory usage and faster responses
echo "Setting model parameters for optimal performance with minimal memory usage..."
curl -X POST http://localhost:11434/api/generate -d '{
    "model": "phi:latest",
    "prompt": "hello",
    "stream": false,
    "options": {
        "num_ctx": 512,
        "num_batch": 128,
        "num_thread": 2,
        "seed": 42
    }
}' > /dev/null

# Ultra-fast minimal warmup with simple questions - optimized for speed
echo "Performing minimal model warmup for speed..."

# Ultra minimal set of warmup questions - just 3 for speed
declare -a WARMUP_QUESTIONS=(
    # One question per main topic
    "Why is the sky blue?"
    "How does the heart work?"
    "What is 2+2?"
    "How do we count to 100?"
    # General questions
    "Why do leaves change color?"
    "How do planes fly?"
    "Why does ice float?"
)

# Process each question with a short pause between to allow model to optimize
for question in "${WARMUP_QUESTIONS[@]}"; do
    echo "Warming up with: $question"
    curl -X POST http://localhost:11434/api/generate -d "{
        \"model\": \"tinyllama:latest\",
        \"prompt\": \"$question\",
        \"stream\": false,
        \"options\": {
            \"num_predict\": 100
        }
    }" > /dev/null
    
    # Small pause between questions
    sleep 0.5
done

# Run a final comprehensive prompt to warm up all model components
echo "Running final warmup sequence..."
curl -X POST http://localhost:11434/api/generate -d '{
    "model": "tinyllama:latest",
    "prompt": "You are a friendly AI assistant for children. Briefly explain what a rainbow is, how it forms, and why it has colors. Then, name the colors of the rainbow in order.",
    "stream": false,
    "options": {
        "num_predict": 200
    }
}' > /dev/null

echo "Advanced Ollama model optimization complete!"
echo "Model is now ready for faster response times."
