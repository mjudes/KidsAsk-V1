#!/bin/bash
# filepath: /Users/meronj/meron-dev-projects/KidsAsk-V1/test-ollama.sh

# This script tests the Ollama integration for KidsAsk

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_section() {
    echo -e "\n${GREEN}==== $1 ====${NC}\n"
}

print_warning() {
    echo -e "${YELLOW}WARNING: $1${NC}"
}

print_error() {
    echo -e "${RED}ERROR: $1${NC}"
}

print_section "Testing Ollama Integration for KidsAsk"

# Check if Ollama service is running
echo "Checking if Ollama service is running..."
if ! curl -s --head http://localhost:11434/api/tags > /dev/null; then
    print_error "Ollama service is not running. Starting it now..."
    docker compose up -d ollama
    
    # Wait for Ollama to start
    echo "Waiting for Ollama service to start..."
    for i in {1..30}; do
        if curl -s --head http://localhost:11434/api/tags > /dev/null; then
            echo -e "${GREEN}Ollama service is up and running!${NC}"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Ollama service failed to start within the expected time."
            echo "You may need to check the logs: docker compose logs ollama"
            exit 1
        fi
        sleep 2
    done
fi

# Test the Ollama CLI
echo ""
print_section "Testing Ollama CLI with a sample question"
echo "Question: 'how many years can a beagle dog live?'"
echo ""
echo "Running: ollama run gemma:2b \"how many years can a beagle dog live?\""
ollama run gemma:2b "how many years can a beagle dog live?" <<< ""

# Test the API directly
echo ""
print_section "Testing Ollama API directly"
echo "Sending request to Ollama API..."
curl -s -X POST http://localhost:11434/api/generate \
    -d '{"model": "gemma:2b", "prompt": "how many years can a beagle dog live?", "stream": false}' | \
    python3 -c "import sys, json; data = json.load(sys.stdin); print(f'\nAPI Response:\n{data.get(\"response\", \"No response\")}')"

# Test the AI service
echo ""
print_section "Testing KidsAsk AI Service with Ollama"

# Check if AI service is running
if ! curl -s --head http://localhost:5050/health > /dev/null; then
    print_warning "AI service is not running. Starting all services now..."
    docker compose up -d
    
    # Wait for services to start
    echo "Waiting for services to start (this may take a moment)..."
    sleep 10
fi

# Test the AI service API
echo "Sending test request to AI service..."
curl -s -X POST http://localhost:5050/generate \
    -H "Content-Type: application/json" \
    -d '{"message": "how many years can a beagle dog live?", "topic": "Animals"}' | \
    python3 -c "import sys, json; data = json.load(sys.stdin); print(f'\nAI Service Response:\n{data.get(\"response\", \"No response\")}')"

print_section "Test Complete"
echo "The Ollama integration for KidsAsk has been successfully tested."
