#!/bin/bash

# KidsAsk.ai setup and run script

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

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker and try again."
    exit 1
fi

# Check if Docker Compose is installed
if ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed or not in the correct version. Please install Docker Compose v2+ and try again."
    exit 1
fi

print_section "KidsAsk.ai Setup"

# Check for Ollama models
if command -v ollama &> /dev/null; then
    print_section "Checking for Ollama models"
    
    # Check if Ollama is already running in Docker
    if ! curl -s --head http://localhost:11434/api/tags > /dev/null; then
        print_warning "Starting Ollama service first"
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
            fi
            sleep 2
        done
    fi
    
    # Check if required models are downloaded
    echo "Checking for required Ollama models..."
    
    models_to_pull=()
    if ! ollama list | grep -q "gemma:2b"; then
        models_to_pull+=("gemma:2b")
    fi
    
    if ! ollama list | grep -q "llama2:7b"; then
        models_to_pull+=("llama2:7b")
    fi
    
    if [ ${#models_to_pull[@]} -gt 0 ]; then
        print_warning "Some required models are not downloaded. Pulling them now..."
        for model in "${models_to_pull[@]}"; do
            echo "Pulling $model (this may take a while)..."
            ollama pull $model
        done
        echo -e "${GREEN}All required models have been downloaded.${NC}"
    else
        echo -e "${GREEN}All required models are already downloaded.${NC}"
    fi
else
    print_warning "Ollama CLI not found. Models will need to be pulled within the container."
    echo "The models will be downloaded automatically when the service starts."
    echo "This may take a while on first run."
fi

# Create .env files if they don't exist
for service in "frontend" "api"; do
    if [ ! -f "./$service/.env" ] && [ -f "./$service/.env.example" ]; then
        print_section "Creating .env file for $service"
        cp ./$service/.env.example ./$service/.env
        echo -e "${GREEN}Created .env file for $service${NC}"
    fi
done

# Choose between development and production mode
print_section "Choose Environment"
echo "Select environment to run KidsAsk.ai:"
echo "1) Development mode (with hot reload)"
echo "2) Production mode"
read -p "Enter your choice (1/2): " env_choice

case $env_choice in
    1)
        print_section "Building and starting services in development mode"
        docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
        ;;
    2)
        print_section "Building and starting services in production mode"
        docker compose up -d --build
        ;;
    *)
        print_error "Invalid choice. Exiting."
        exit 1
        ;;
esac

print_section "KidsAsk.ai is starting up!"
echo -e "Frontend will be available at: ${GREEN}http://localhost:3050${NC}"
echo -e "API Gateway will be available at: ${GREEN}http://localhost:4000${NC}"
echo -e "AI Service will be available at: ${GREEN}http://localhost:5050${NC}"
echo ""
echo -e "${YELLOW}NOTE: It may take a few moments for all services to fully initialize.${NC}"
echo ""
echo -e "To view logs, use: ${GREEN}docker compose logs -f${NC}"
echo -e "To stop all services, use: ${GREEN}docker compose down${NC}"

# Check if services are running
print_section "Checking service status"
sleep 5
docker compose ps
