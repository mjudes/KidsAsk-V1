#!/bin/bash
# Script to update the OpenAI service with the latest API key

# Text colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Updating KidsAsk-V1 OpenAI Service${NC}"
echo "=================================="
echo ""

# Check if .env file exists with OPENAI_API_KEY
if grep -q "OPENAI_API_KEY" .env; then
    echo -e "${GREEN}Found OpenAI API key in .env file${NC}"
else
    echo -e "${RED}No OpenAI API key found in .env file. Please run ./setup-openai.sh first.${NC}"
    exit 1
fi

# Restart the AI service
echo -e "${YELLOW}Stopping AI service...${NC}"
docker-compose down ai-service
echo -e "${YELLOW}Rebuilding AI service...${NC}"
docker-compose build ai-service
echo -e "${YELLOW}Starting AI service...${NC}"
docker-compose up -d ai-service

echo ""
echo -e "${GREEN}AI service has been updated and restarted.${NC}"
echo -e "To check the logs, run: ${YELLOW}docker-compose logs -f ai-service${NC}"
echo ""
