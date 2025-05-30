#!/bin/bash
# Ollama Performance Tuning Script for MacBook Pro

echo "==================================================="
echo "Ollama Performance Tuning Script for MacBook Pro"
echo "==================================================="

# Detect Mac hardware
if [[ $(uname -m) == 'arm64' ]]; then
  MAC_TYPE="Apple Silicon"
  IS_M_SERIES=true
else
  MAC_TYPE="Intel"
  IS_M_SERIES=false
fi

# Get number of CPU cores
CPU_CORES=$(sysctl -n hw.ncpu)

# Get available memory
TOTAL_MEM_GB=$(( $(sysctl -n hw.memsize) / 1024 / 1024 / 1024 ))

echo "Detected hardware:"
echo "- Processor: $MAC_TYPE"
echo "- CPU Cores: $CPU_CORES"
echo "- Memory: ${TOTAL_MEM_GB}GB"
echo

# Calculate optimal settings
if [ "$IS_M_SERIES" = true ]; then
  # Apple Silicon optimizations
  OPTIMAL_THREADS=$((CPU_CORES >= 8 ? 8 : CPU_CORES))
  OPTIMAL_GPU_LAYERS=32
  
  if [ $TOTAL_MEM_GB -ge 32 ]; then
    OPTIMAL_MODEL="llama2:13b"
    OPTIMAL_CTX=4096
  elif [ $TOTAL_MEM_GB -ge 16 ]; then
    OPTIMAL_MODEL="llama2:7b"
    OPTIMAL_CTX=4096
  else
    OPTIMAL_MODEL="llama2:7b"
    OPTIMAL_CTX=2048
  fi
else
  # Intel optimizations
  OPTIMAL_THREADS=$((CPU_CORES > 4 ? CPU_CORES - 2 : CPU_CORES))
  OPTIMAL_GPU_LAYERS=0
  
  if [ $TOTAL_MEM_GB -ge 32 ]; then
    OPTIMAL_MODEL="llama2:7b"
    OPTIMAL_CTX=4096
  else
    OPTIMAL_MODEL="llama2:7b"
    OPTIMAL_CTX=2048
  fi
fi

echo "Recommended Ollama settings for your MacBook Pro:"
echo "- Base Model: $OPTIMAL_MODEL"
echo "- Number of threads: $OPTIMAL_THREADS"
echo "- GPU layers: $OPTIMAL_GPU_LAYERS"
echo "- Context size: $OPTIMAL_CTX tokens"
echo

# Ask if user wants to apply these settings
read -p "Would you like to apply these optimized settings? (y/n): " APPLY_SETTINGS

if [[ $APPLY_SETTINGS == "y" || $APPLY_SETTINGS == "Y" ]]; then
  echo "Updating docker-compose.yml with optimized settings..."
  
  # Update docker-compose.yml using sed
  sed -i.bak "s/OLLAMA_NUM_THREADS=.*/OLLAMA_NUM_THREADS=$OPTIMAL_THREADS/" /Users/meronj/meron-dev-projects/KidsAsk-V1/docker-compose.yml
  sed -i.bak "s/OLLAMA_GPU_LAYERS=.*/OLLAMA_GPU_LAYERS=$OPTIMAL_GPU_LAYERS/" /Users/meronj/meron-dev-projects/KidsAsk-V1/docker-compose.yml
  
  # Update modelfile
  echo "Updating model configuration..."
  sed -i.bak "s/FROM .*/FROM $OPTIMAL_MODEL/" /Users/meronj/meron-dev-projects/KidsAsk-V1/ollama-service/config/kidsai-modelfile
  sed -i.bak "s/PARAMETER num_ctx .*/PARAMETER num_ctx $OPTIMAL_CTX/" /Users/meronj/meron-dev-projects/KidsAsk-V1/ollama-service/config/kidsai-modelfile
  
  echo "Settings updated successfully!"
  echo
  echo "To apply these changes, restart the services with:"
  echo "docker compose down"
  echo "docker compose up -d"
  echo
  echo "Note: The first run with new settings may take longer as the model might need to be downloaded again."
else
  echo "No changes were made to the configuration."
fi

echo
echo "==================================================="
echo "For manual tuning, edit the following files:"
echo "- /Users/meronj/meron-dev-projects/KidsAsk-V1/docker-compose.yml"
echo "- /Users/meronj/meron-dev-projects/KidsAsk-V1/ollama-service/config/kidsai-modelfile"
echo "==================================================="
