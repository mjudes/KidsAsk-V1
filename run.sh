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
        export NODE_ENV=development
        export FLASK_DEBUG=true
        export FRONTEND_COMMAND="npm run dev"
        export API_COMMAND="npm run dev"
        docker compose up -d --build
        ;;
    2)
        print_section "Building and starting services in production mode"
        export NODE_ENV=production
        export FLASK_DEBUG=false
        export FRONTEND_COMMAND="npm start"
        export API_COMMAND="npm start"
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
echo ""
echo -e "${YELLOW}NOTE: It may take a few moments for all services to fully initialize.${NC}"
echo ""
echo -e "To view logs, use: ${GREEN}docker compose logs -f${NC}"
echo -e "To stop all services, use: ${GREEN}docker compose down${NC}"

# Check if services are running
print_section "Checking service status"
sleep 5
docker compose ps
