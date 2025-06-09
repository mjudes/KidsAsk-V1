#!/bin/bash
# Comprehensive diagnostic script for OpenAI integration in KidsAsk-V1

# Text colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}KidsAsk-V1 OpenAI Diagnostic Tool${NC}"
echo "=================================="
echo ""

# Check if we have an OpenAI API key in the environment
echo -e "${YELLOW}Checking OpenAI API key configuration...${NC}"
if grep -q "OPENAI_API_KEY" .env; then
    # Get the first few characters to confirm it's a real key without revealing it all
    API_KEY=$(grep "OPENAI_API_KEY" .env | cut -d'=' -f2)
    KEY_START=$(echo $API_KEY | cut -c1-5)
    KEY_LENGTH=${#API_KEY}
    
    if [[ $KEY_LENGTH -lt 20 ]]; then
        echo -e "${RED}OpenAI API key appears to be invalid (too short)${NC}"
        echo -e "Found: $API_KEY (length: $KEY_LENGTH characters)"
        echo -e "API keys should typically be around 50+ characters long"
    elif [[ $KEY_START == "sk-" ]]; then
        echo -e "${GREEN}API key format looks valid (starts with 'sk-')${NC}"
        echo -e "Key length: $KEY_LENGTH characters"
    else
        echo -e "${YELLOW}API key format may be unusual (doesn't start with 'sk-')${NC}"
        echo -e "Key length: $KEY_LENGTH characters"
    fi
else
    echo -e "${RED}No OpenAI API key found in .env file${NC}"
fi

# Check if the AI service is running
echo -e "\n${YELLOW}Checking AI service status...${NC}"
if docker-compose ps | grep -q "ai-service" | grep -q "Up"; then
    echo -e "${GREEN}AI service container is running${NC}"
else
    echo -e "${RED}AI service container is not running${NC}"
    echo -e "Run: docker-compose up -d ai-service"
    exit 1
fi

# Check API connectivity
echo -e "\n${YELLOW}Testing AI service API connectivity...${NC}"
HEALTH_RESPONSE=$(curl -s http://localhost:5050/health)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}API is responding!${NC}"
    echo -e "Health response: $HEALTH_RESPONSE"
else
    echo -e "${RED}API is not responding${NC}"
    exit 1
fi

# Check container logs
echo -e "\n${YELLOW}Checking recent container logs for errors...${NC}"
ERROR_COUNT=$(docker-compose logs --tail=20 ai-service | grep -c "ERROR")
if [ $ERROR_COUNT -gt 0 ]; then
    echo -e "${RED}Found $ERROR_COUNT errors in recent logs${NC}"
    echo -e "${BLUE}Log excerpt:${NC}"
    docker-compose logs --tail=10 ai-service | grep "ERROR"
else
    echo -e "${GREEN}No recent errors found in logs${NC}"
fi

# Test OpenAI integration with a simple question
echo -e "\n${YELLOW}Testing a simple question about animals...${NC}"
echo -e "Query: 'What do lions eat?', Topic: 'Animals'"
RESPONSE=$(curl -s -X POST http://localhost:5050/generate \
  -H "Content-Type: application/json" \
  -d '{"message": "What do lions eat?", "topic": "Animals"}')
  
echo -e "${BLUE}Response:${NC}"
echo $RESPONSE | jq .

# Verify OpenAI version in container
echo -e "\n${YELLOW}Checking OpenAI package version in container...${NC}"
OPENAI_VERSION=$(docker-compose exec -T ai-service pip show openai | grep Version)
echo -e "Installed: $OPENAI_VERSION"
echo -e "Required: Version: 0.28.0"

echo ""
echo -e "${YELLOW}Diagnostic complete!${NC}"
echo ""
echo -e "If you're still having issues, try these steps:"
echo -e "1. Ensure your OpenAI API key is valid and has sufficient quota"
echo -e "2. Rebuild the AI service: ${BLUE}docker-compose build ai-service${NC}"
echo -e "3. Restart all services: ${BLUE}docker-compose down && docker-compose up -d${NC}"
echo -e "4. Check additional logs: ${BLUE}docker-compose logs ai-service${NC}"
echo ""
