#!/bin/bash

echo "Starting KidsAsk.ai services..."

# Change to the project directory
cd /Users/meronj/meron-dev-projects/KidsAsk-V1

# Make advanced warmup script executable
#chmod +x ./advanced-warmup.sh

# Start the containers
docker-compose -f docker-compose.yml up -d

# Wait for Ollama to be available
#echo "Waiting for Ollama service to be ready..."
#sleep 10

# Run the advanced model optimization script
#echo "Running advanced model optimization for better performance..."
#./advanced-warmup.sh

echo "KidsAsk.ai is now running with optimized AI performance!"
