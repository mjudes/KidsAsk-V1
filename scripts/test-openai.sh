#!/bin/bash
# Test OpenAI Integration for KidsAsk-V1

# Text colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing OpenAI Integration${NC}"
echo "=========================="
echo ""

# Check if the AI service is running
echo -e "${YELLOW}Checking AI service status...${NC}"
response=$(curl -s http://localhost:5050/health)

if [ $? -eq 0 ]; then
  echo -e "${GREEN}AI service is running!${NC}"
  echo "Response: $response"
  echo ""
else
  echo -e "${RED}Error: AI service is not running.${NC}"
  echo "Make sure to start the services with './start.sh' before running this test."
  exit 1
fi

# Test a simple question
echo -e "${YELLOW}Testing a simple question about space...${NC}"
curl -s -X POST http://localhost:5050/generate \
  -H "Content-Type: application/json" \
  -d '{"message": "Why is the sky blue?", "topic": "Everyday Why Questions"}' | jq .

echo ""
echo -e "${GREEN}Test complete!${NC}"
echo ""
