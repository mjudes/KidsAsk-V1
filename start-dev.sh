#!/bin/bash

# Set environment to development
export NODE_ENV=development
export FLASK_DEBUG=true
export FRONTEND_COMMAND="npm run dev"
export API_COMMAND="npm run dev"

cd /Users/meronj/meron-dev-projects/KidsAsk-V1 && docker compose up -d
