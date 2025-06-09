#!/bin/bash
# Quick restart script for KidsAsk with optimizations
# Created on June 1, 2025

echo "🔄 Restarting KidsAsk with performance optimizations..."

# Stop containers
echo "Stopping current containers..."
docker-compose down

# Clear any cached data from containers (optional)
docker system prune -f

# Set environment variables for performance
export OLLAMA_NUM_THREADS=2
export OLLAMA_MODELS_PATH=/tmp/ollama-models

# Restart with optimized settings
echo "Starting containers with optimized settings..."
docker-compose up -d

# Wait for containers to be ready
echo "Waiting for services to be ready..."
sleep 5

# Run the instant-cache script to set up pre-cached responses
echo "Setting up instant response cache..."
./instant-cache.sh

# Run the minimal warmup script
echo "Running minimal model warmup..."
./advanced-warmup.sh

echo "✅ KidsAsk is now running with ultra-fast response time optimizations"
echo "Try asking 'how big is the heart' for a 1-2ms response!"
