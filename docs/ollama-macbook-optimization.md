# Ollama AI Optimization for MacBook Pro

This document provides detailed information on optimizing the Ollama AI service for different MacBook Pro models to achieve the best performance.

## Optimization Overview

The Ollama AI service can be tuned for:
- Latency (response speed)
- Memory usage
- CPU/GPU utilization

## MacBook Pro Hardware Considerations

### Apple Silicon (M1/M2/M3) MacBook Pro

Apple Silicon MacBooks can take advantage of the Neural Engine and unified memory architecture:

| Model | Recommended Settings |
|-------|---------------------|
| M1 Pro/Max (16GB+) | <ul><li>Model: llama2:7b</li><li>Threads: 8</li><li>GPU Layers: 32</li><li>Context: 4096</li></ul> |
| M2 Pro/Max (16GB+) | <ul><li>Model: llama2:13b</li><li>Threads: 8</li><li>GPU Layers: 32</li><li>Context: 4096</li></ul> |
| M3 Pro/Max (16GB+) | <ul><li>Model: llama2:13b</li><li>Threads: 10</li><li>GPU Layers: 48</li><li>Context: 4096</li></ul> |
| Any M-series (8GB) | <ul><li>Model: llama2:7b</li><li>Threads: 4</li><li>GPU Layers: 24</li><li>Context: 2048</li></ul> |

### Intel MacBook Pro

Intel MacBooks rely primarily on CPU performance:

| Model | Recommended Settings |
|-------|---------------------|
| Intel Core i7/i9 (16GB+) | <ul><li>Model: llama2:7b</li><li>Threads: CPU Cores - 2</li><li>GPU Layers: 0</li><li>Context: 2048</li></ul> |
| Intel Core i5 (8GB) | <ul><li>Model: phi:latest</li><li>Threads: CPU Cores - 1</li><li>GPU Layers: 0</li><li>Context: 2048</li></ul> |

## Configuration Parameters

### OLLAMA_NUM_THREADS

Controls how many CPU threads Ollama will use. Higher values can improve performance but may cause system slowdowns if set too high.

```bash
# Example in docker-compose.yml
OLLAMA_NUM_THREADS=4
```

### OLLAMA_GPU_LAYERS

Controls how many layers of the model will run on the GPU. For Apple Silicon, higher values (up to the model's layer count) will improve performance. For Intel Macs without dedicated GPUs, keep this at 0.

```bash
# Example in docker-compose.yml
OLLAMA_GPU_LAYERS=32
```

### Context Size (num_ctx)

Controls how much context the model can consider when responding. Higher values allow for more complex conversations but require more memory.

```
# Example in kidsai-modelfile
PARAMETER num_ctx 2048
```

## Using the Optimization Script

The `ollama-tune.sh` script will automatically detect your MacBook Pro's hardware and recommend optimal settings:

```bash
./ollama-tune.sh
```

## Manual Performance Testing

After making optimizations, use the benchmark script to test performance:

```bash
./ollama-benchmark.sh
```

A good average response time is under 3 seconds. If responses are taking longer, consider:
1. Reducing the model size
2. Decreasing the context size
3. Closing other resource-intensive applications

## Troubleshooting

If you encounter performance issues:

1. Check system resources with Activity Monitor
2. Make sure your MacBook is plugged in (performance is throttled on battery)
3. Try restarting the Ollama services:
   ```bash
   docker compose restart ollama-service ollama-api
   ```
4. If using an external model, try switching to the default llama2:7b model
