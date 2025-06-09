# KidsAsk AI Service - Ollama Integration

This document provides instructions for the updated KidsAsk AI service which now uses Ollama instead of OpenAI.

## Changes Made

1. Updated AI service to use Ollama's local models instead of OpenAI API
2. Added Ollama service to the Docker Compose configuration
3. Created CLI tool for testing Ollama models
4. Updated scripts for setup and testing

## Requirements

- Docker and Docker Compose
- Ollama CLI (optional, for local model management)

## Getting Started

### 1. Start the Services

Simply run the updated start script:

```bash
./run.sh
```

The script will:
- Check if Ollama is installed locally
- Start the Ollama service in Docker
- Pull required models if necessary
- Start all the KidsAsk services

### 2. Test the Ollama Integration

You can test the Ollama integration using the provided test script:

```bash
./test-ollama.sh
```

This will run several tests:
1. Testing the Ollama CLI directly
2. Testing the Ollama API directly
3. Testing the KidsAsk AI service with Ollama

### 3. Using the CLI Tool

You can use the CLI tool to ask questions directly to the Ollama model:

```bash
python ai-service/src/cli.py "how many years can a beagle dog live?"
```

Or use Ollama directly:

```bash
ollama run gemma:2b "how many years can a beagle dog live?"
```

## Available Models

The KidsAsk application is configured to use:
- Primary model: gemma:2b
- Fallback model: llama2:7b

You can change the models in the `ai-service/config/model_config.json` file.

## Troubleshooting

### Model Download Issues

If you're having issues with model downloads:

1. Start just the Ollama service:
   ```bash
   docker compose up -d ollama
   ```

2. Pull the models manually:
   ```bash
   ollama pull gemma:2b
   ollama pull llama2:7b
   ```

### API Connection Issues

If the AI service can't connect to Ollama:

1. Check that the Ollama service is running:
   ```bash
   docker compose ps ollama
   ```

2. Check the Ollama logs:
   ```bash
   docker compose logs ollama
   ```

3. Verify the API is accessible:
   ```bash
   curl http://localhost:11434/api/tags
   ```
