#!/bin/bash

# Script to optimize Ollama model for faster response times
# This script warms up the model and prepares it for efficient response

echo "Optimizing Ollama models for performance..."

# Wait for Ollama service to be ready
echo "Waiting for Ollama service to be available..."
until curl -s http://localhost:11434/api/tags >/dev/null; do
    echo "Waiting for Ollama service..."
    sleep 2
done

# Check if the model exists and pull if not
if ! curl -s http://localhost:11434/api/tags | grep -q "gemma:2b"; then
    echo "Pulling gemma:2b model..."
    curl -X POST http://localhost:11434/api/pull -d '{"name": "gemma:2b"}'
fi

# Warmup the model with common questions to load it into memory
echo "Warming up the model with test questions..."
WARMUP_QUESTIONS=(
    "What is the sky blue?"
    "How tall are giraffes?"
    "Why do birds fly?"
    "How do plants grow?"
    "What are dinosaurs?"
)

for question in "${WARMUP_QUESTIONS[@]}"; do
    echo "Sending warmup question: $question"
    curl -X POST http://localhost:11434/api/generate -d "{
        \"model\": \"gemma:2b\",
        \"prompt\": \"$question\",
        \"stream\": false,
        \"options\": {
            \"num_predict\": 100
        }
    }" > /dev/null
done

# Set model parameters for better performance
echo "Setting model parameters for optimal performance..."
curl -X POST http://localhost:11434/api/generate -d '{
    "model": "gemma:2b",
    "prompt": "hello",
    "stream": false,
    "options": {
        "num_ctx": 2048,
        "num_batch": 256,
        "num_thread": 4,
        "num_gpu": 1,
        "seed": 42
    }
}' > /dev/null

echo "Ollama model optimization complete!"