#!/bin/bash
# OpenAI Setup Script for KidsAsk-V1
# This script validates and configures the OpenAI integration

# Text colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}KidsAsk-V1 OpenAI Setup${NC}"
echo "=============================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    touch .env
fi

# Always prompt for a new API key to ensure it's valid
echo -e "${YELLOW}Please enter your OpenAI API key:${NC} "
read -s OPENAI_API_KEY

if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "\n${RED}No API key provided. Exiting setup.${NC}"
    exit 1
fi

# Update or add API key to .env file
if grep -q "OPENAI_API_KEY" .env; then
    # Replace existing API key
    sed -i '' "s|OPENAI_API_KEY=.*|OPENAI_API_KEY=$OPENAI_API_KEY|g" .env
    echo -e "\n${GREEN}Updated API key in .env file${NC}"
else
    # Add new API key
    echo "OPENAI_API_KEY=$OPENAI_API_KEY" >> .env
    echo -e "\n${GREEN}Added API key to .env file${NC}"
fi

# Check if OPENAI_MODEL is already in .env
if grep -q "OPENAI_MODEL" .env; then
    echo -e "${GREEN}OpenAI model configuration found in .env file${NC}"
else
    # Add default model to .env file
    echo "OPENAI_MODEL=gpt-4o-mini" >> .env
    echo -e "${GREEN}Default model (gpt-4o-mini) added to .env file${NC}"
fi

# Rebuild and restart the AI service
echo -e "\n${YELLOW}Rebuilding and restarting the AI service...${NC}"
docker-compose down ai-service
docker-compose build ai-service
docker-compose up -d ai-service

echo ""
echo -e "${GREEN}Setup complete! Your KidsAsk-V1 application is now configured to use OpenAI.${NC}"
echo ""
echo -e "To test the OpenAI integration, run: ${YELLOW}./test-openai.sh${NC}"
echo -e "To start the application, run: ${YELLOW}./start.sh${NC}"
echo -e "To stop the application, run: ${YELLOW}./stop.sh${NC}"
echo ""
echo -e "${YELLOW}Note:${NC} Make sure your OpenAI API key has access to the gpt-4o-mini model."
echo ""
