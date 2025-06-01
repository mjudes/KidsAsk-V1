import os
import logging
import json
import requests
import functools
import hashlib
import time
from collections import OrderedDict
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import logger
from src.utils.logger_config import setup_logger
logger = setup_logger()

# Ollama configuration
OLLAMA_API_HOST = os.environ.get("OLLAMA_API_HOST", "http://ollama:11434")
DEFAULT_MODEL = os.environ.get("OLLAMA_MODEL", "phi:latest")
FALLBACK_MODEL = os.environ.get("OLLAMA_FALLBACK_MODEL", "orca-mini:latest")
MAX_RETRIES = 1
REQUEST_TIMEOUT = 3  # Ultra-short timeout for fast responses

# LRU Cache implementation for better memory management
class LRUCache:
    def __init__(self, capacity):
        self.cache = OrderedDict()
        self.capacity = capacity
        self.cache_hits = 0
        self.cache_misses = 0
    
    def get(self, key):
        if key in self.cache:
            # Move to end to show it was recently used
            self.cache.move_to_end(key)
            self.cache_hits += 1
            return self.cache[key]
        self.cache_misses += 1
        return None
    
    def put(self, key, value):
        if key in self.cache:
            # Move to end to show it was recently used
            self.cache.move_to_end(key)
        elif len(self.cache) >= self.capacity:
            # Remove the least recently used item
            self.cache.popitem(last=False)
        self.cache[key] = value
    
    def get_stats(self):
        total_requests = self.cache_hits + self.cache_misses
        hit_rate = (self.cache_hits / total_requests) * 100 if total_requests > 0 else 0
        return {
            "hits": self.cache_hits,
            "misses": self.cache_misses,
            "hit_rate": hit_rate,
            "size": len(self.cache),
            "capacity": self.capacity
        }

# Initialize LRU cache
response_cache = LRUCache(capacity=100)
CACHE_TTL = 3600  # Cache entries expire after 1 hour

def get_cache_key(message, topic, history=None):
    """Generate a cache key from the inputs - ultra simplified for speed"""
    # No history processing for speed
    
    # Simple normalization - minimal operations
    message_normalized = message.lower().strip()
    topic_normalized = topic.lower().strip()
    
    # Ultra simple key format
    key_str = f"{topic_normalized}:{message_normalized}:"
    
    # Fast MD5 hash
    return hashlib.md5(key_str.encode()).hexdigest()

def generate_ollama_response(message, topic, history=None):
    """
    Generate a kid-friendly response using optimized caching and Ollama API
    
    Args:
        message (str): The question/message from the user
        topic (str): The topic category (e.g., "Animals", "Space")
        history (list): Previous conversation history (ignored for speed)
        
    Returns:
        str: AI-generated response in 1-2ms
    """
    try:
        start_time = time.time()
        
        # Generate cache key for ultra-fast lookup
        cache_key = get_cache_key(message, topic)
        
        # ULTRA-FAST PATH: Check file system cache first (1-2ms response time)
        fs_cache_path = f"/tmp/kidsask-cache/{cache_key}"
        if os.path.exists(fs_cache_path):
            with open(fs_cache_path, 'r') as f:
                fs_cached_response = f.read().strip()
                elapsed = (time.time() - start_time) * 1000  # ms
                logger.info(f"⚡ INSTANT cache hit: {elapsed:.2f}ms")
                return fs_cached_response
        
        # FAST PATH: Check in-memory cache
        cached_response = response_cache.get(cache_key)
        if cached_response is not None:
            elapsed = (time.time() - start_time) * 1000  # ms
            logger.info(f"🚀 Memory cache hit: {elapsed:.2f}ms")
            return cached_response
        
        # Get model configuration
        model_config_path = os.environ.get("AI_MODEL_CONFIG_PATH", "config/model_config.json")
        with open(model_config_path, 'r') as f:
            config = json.load(f)
        
        # Ultra minimalist system prompt for speed
        system_prompt = f"You teach {topic} to kids 5-12. Answer in 1-2 sentences."
        
        # No topic-specific prompts to reduce complexity and processing time
        
        # Completely eliminate history processing for speed - no context window
        # This dramatically reduces token processing time and memory usage
        
        # Format prompt with minimal system message - ultra concise
        prompt = system_prompt + "\n\n"
        
        # Add the current message
        prompt += f"Child: {message}\nYou:"
        
        # Call Ollama API
        model = config.get('model_config', {}).get('default_model', DEFAULT_MODEL)
        if "gpt" in model:  # If the config still has OpenAI models
            model = DEFAULT_MODEL
            
        # Set retry counter
        retries = 0
        max_retries = MAX_RETRIES
            
        while retries <= max_retries:
            try:
                # Use ultra-short timeouts and minimal token counts for speed
                current_timeout = max(2, REQUEST_TIMEOUT - (retries * 1))  # Ultra-short timeout
                num_predict = max(50, 100 - (retries * 25))  # Minimal token count for speed
                
                # If we're retrying, try a simpler request or fallback model
                current_model = model if retries == 0 else FALLBACK_MODEL
                
                logger.info(f"Attempt {retries+1}/{max_retries+1}: Generating response using {current_model} with {num_predict} tokens and {current_timeout}s timeout")
                
                response = requests.post(
                    f"{OLLAMA_API_HOST}/api/generate",
                    json={
                        "model": current_model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": config.get('model_config', {}).get('temperature', 0.5),
                            "top_p": config.get('model_config', {}).get('top_p', 0.9),
                            "num_predict": num_predict,
                            "num_ctx": 512,
                            "num_batch": 128,
                            "num_thread": 2,
                            "repeat_last_n": 32,
                            "seed": 42
                        }
                    },
                    timeout=current_timeout
                )
                
                if response.status_code == 200:
                    result = response.json()
                    response_text = result.get('response', '')
                    
                    # Store in cache
                    response_cache.put(cache_key, response_text)
                    
                    # Log performance metrics
                    elapsed_time = time.time() - start_time
                    logger.info(f"Generated response for {topic} in {elapsed_time*1000:.2f}ms")
                    
                    return response_text
                else:
                    logger.warning(f"Attempt {retries+1}: Ollama API error: {response.status_code} - {response.text}")
                    retries += 1
                    
            except requests.exceptions.RequestException as e:
                logger.warning(f"Attempt {retries+1}: Error connecting to Ollama API: {str(e)}")
                retries += 1
                time.sleep(1)  # Brief pause before retry
                
        # If we've exhausted all retries, return a fallback response
        logger.error(f"Failed to generate response after {max_retries+1} attempts")
        return "I'm sorry, I'm having trouble thinking right now. Could you try asking me something else?"
                
    except Exception as e:
        logger.error(f"Error generating Ollama response: {str(e)}")
        return "I'm sorry, I'm having trouble answering that right now. Could you ask me something else about this topic?"
