#!/bin/bash

# Set default environment to production
export NODE_ENV=production
export FLASK_DEBUG=false
export FRONTEND_COMMAND="npm start"
export API_COMMAND="npm start"

cd /Users/meronj/meron-dev-projects/KidsAsk-V1 && docker compose up -d
