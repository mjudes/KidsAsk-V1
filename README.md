# KidsAsk.ai

KidsAsk.ai is a kid-friendly AI assistant websi4. Access the application
   - Frontend: http://localhost:3050
   - API Gateway: http://localhost:4000
   - AI Service: http://localhost:5050hat answers children's questions on specific educational topics. The platform is designed to be safe, educational, and engaging for children while providing accurate information in an age-appropriate manner.

## Features

- **Kid-friendly AI responses**: Tailored for children aged 5-12
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
- **AI Service**: Python, Flask, OpenAI GPT-4o Mini
- **Database**: MongoDB
- **Infrastructure**: Docker, Docker Compose

## Getting Started

### Prerequisites

- Docker and Docker Compose
- OpenAI API key

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/kidsask-ai.git
   cd kidsask-ai
   ```

2. Set up OpenAI integration
   ```bash
   ./setup-openai.sh
   ```
   - This script will create a `.env` file with your OpenAI API key
   - You'll need an API key with access to the GPT-4o Mini model

3. Build and start the containers
   ```bash
   docker-compose up -d --build
   ```

4. Access the application
   - Frontend: http://localhost:3050
   - API Gateway: http://localhost:4000
   - AI Service: http://localhost:5050

## Development

### Project Structure

```
kidsask-ai/
├── docker-compose.yml    # Docker Compose configuration
├── frontend/            # Next.js frontend
├── api/                 # Express API gateway
└── ai-service/          # Flask AI service
```

### Running in Development Mode

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for the underlying language model
- All contributors to the educational content
