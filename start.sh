#!/bin/bash

echo "Starting KidsAsk.ai services..."

# Change to the project directory
cd /Users/meronj/meron-dev-projects/KidsAsk-V1

# Start the containers
docker-compose -f docker-compose.yml up -d

echo "KidsAsk.ai is now running with optimized AI performance!"
