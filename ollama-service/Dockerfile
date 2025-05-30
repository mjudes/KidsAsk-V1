FROM ollama/ollama:latest

# Set working directory
WORKDIR /app

# Copy configuration files
COPY ./config /app/config

# Create a volume for Ollama models
VOLUME /root/.ollama

# Expose Ollama API port
EXPOSE 11434

# Environment variables for optimization
ENV OLLAMA_HOST=0.0.0.0
ENV OLLAMA_NUM_THREADS=4
ENV OLLAMA_GPU_LAYERS=1
ENV OLLAMA_MODELS=/root/.ollama/models

# Set custom entrypoint script
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Start Ollama service
ENTRYPOINT ["/entrypoint.sh"]
