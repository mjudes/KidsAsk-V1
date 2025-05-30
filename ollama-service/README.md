# Ollama AI Service for KidsAsk

This service integrates the Ollama LLM engine with KidsAsk to provide AI-powered responses to children's questions. It uses a locally-hosted LLama 2 model optimized for kid-friendly content.

## Features

- Uses the lightweight and efficient Ollama engine
- Custom-tuned 7B parameter model optimized for MacBook Pro
- Kid-friendly responses with safety guardrails
- Low-latency responses through local execution
- Automatic fallback to pre-written responses if needed

## System Requirements

- MacBook Pro (Intel or Apple Silicon)
- At least 8GB RAM (16GB recommended)
- Docker Desktop for Mac
- At least 5GB free disk space for model storage

## Setup and Usage

The Ollama service is automatically started when you run the KidsAsk application using the standard scripts:

```bash
./start.sh    # Production mode
./start-dev.sh # Development mode
```

On first startup, the system will download the Llama 2 7B model, which may take some time depending on your internet connection. Subsequent startups will be faster.

## Performance Optimization

The Ollama service is pre-configured with optimal settings for MacBook Pro, but you can adjust them for your specific hardware:

### For M1/M2 MacBook Pro
- Increase `OLLAMA_NUM_THREADS` to 8 in docker-compose.yml
- Set `OLLAMA_GPU_LAYERS` to 32 to use Metal acceleration

### For Intel MacBook Pro
- Set `OLLAMA_NUM_THREADS` to match your CPU core count
- Set `OLLAMA_GPU_LAYERS` to 0 (no GPU acceleration)

## Checking Service Status

You can check the status of the Ollama service using:

```bash
./ollama-health-check.sh
```

## Troubleshooting

If you encounter issues with the Ollama service:

1. Check container logs:
   ```
   docker logs kidsask-v1-ollama-service-1
   docker logs kidsask-v1-ollama-api-1
   ```

2. Restart the services:
   ```
   docker compose restart ollama-service ollama-api
   ```

3. Clear the model cache and restart (if model is corrupted):
   ```
   docker compose down
   docker volume rm kidsask-v1_ollama_data
   docker compose up -d
   ```

## Technical Details

- Base model: LLama 2 7B
- API Interface: REST API on port 5050 (external), port 5000 (internal)
- Ollama Engine: Accessible on port 11434
- System prompt includes kid-friendly guidelines
- Temperature: 0.7 (balanced creativity and coherence)
- Context window: 2048 tokens
