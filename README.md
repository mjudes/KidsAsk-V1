# KidsAsk.ai

KidsAsk.ai is a kid-friendly educational website that answers children's questions on specific educational topics. The platform is designed to be safe, educational, and engaging for children while providing accurate information in an age-appropriate manner.

## Features

- **Kid-friendly responses**: Tailored for children aged 5-12
- **Topic-based questions**: Focused on 12 educational topics
- **Content filtering**: Ensures all interactions are appropriate for children
- **Responsive design**: Works on desktops, tablets, and mobile devices
- **Docker containerization**: Easy deployment and scalability

## Educational Topics

KidsAsk.ai focuses on the following educational topics:

1. Animals
2. Space and Planets
3. The Human Body
4. Dinosaurs
5. Weather and Natural Phenomena
6. Sports (Team and Individual)
7. Technology and Robots
8. The Ocean
9. Mythical Creatures and Magic
10. Everyday Why Questions
11. Math
12. Lego

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **API Gateway**: Node.js, Express
- **Database**: MongoDB
- **AI Engine**: Ollama (Llama 2 model)
- **Infrastructure**: Docker, Docker Compose

## Getting Started

### Prerequisites

- Docker and Docker Compose

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/kidsask-ai.git
   cd kidsask-ai
   ```

2. Set up environment variables
   - Copy the `.env.example` files in each service directory to `.env`

3. Build and start the containers
   ```bash
   docker compose up -d --build
   ```

4. Access the application
   - Frontend: http://localhost:3050
   - API Gateway: http://localhost:4000
   - Ollama API: http://localhost:5050
   - Ollama Engine: http://localhost:11434

### Performance Optimization

For optimal performance on your MacBook Pro, you can run the tuning script:

```bash
./ollama-tune.sh
```

This will detect your hardware and recommend the best settings for running the Ollama AI service.

## Development

### Project Structure

```
kidsask-ai/
├── docker-compose.yml    # Docker Compose configuration
├── frontend/            # Next.js frontend
└── api/                 # Express API gateway
```

### Running in Development Mode

```bash
# Either use the run.sh script and select option 1
./run.sh

# Or use the start-dev.sh script
./start-dev.sh
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
