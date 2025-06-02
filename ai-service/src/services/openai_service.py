import os
import logging
import json
import time
import hashlib
from collections import OrderedDict
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import logger
from src.utils.logger_config import setup_logger
logger = setup_logger()

# OpenAI configuration
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
DEFAULT_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
MAX_RETRIES = 2
REQUEST_TIMEOUT = 15  # Timeout in seconds

# Import and initialize OpenAI - using legacy approach for compatibility
import openai
openai.api_key = OPENAI_API_KEY
logger.info("OpenAI client initialized with legacy approach")

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

def get_cache_key(message, topic, history=None):
    """Generate a cache key from the inputs"""
    # Simple normalization
    message_normalized = message.lower().strip()
    topic_normalized = topic.lower().strip()
    
    # Simple key format
    key_str = f"{topic_normalized}:{message_normalized}:"
    
    # If history is provided, include it in the cache key
    if history and len(history) > 0:
        # Only include the last exchange to keep the cache key manageable
        last_exchange = history[-1]
        key_str += f"{last_exchange.get('role', '')}:{last_exchange.get('content', '').lower().strip()}"
    
    # Generate MD5 hash
    return hashlib.md5(key_str.encode()).hexdigest()

def generate_openai_response(message, topic, history=None):
    """
    Generate a kid-friendly response using OpenAI's API
    
    Args:
        message (str): The question/message from the user
        topic (str): The topic category (e.g., "Animals", "Space")
        history (list): Previous conversation history
        
    Returns:
        str: AI-generated response
    """
    try:
        start_time = time.time()
        
        # Generate cache key for lookup
        cache_key = get_cache_key(message, topic, history)
        
        # Check file system cache first
        fs_cache_path = f"/tmp/kidsask-cache/{cache_key}"
        if os.path.exists(fs_cache_path):
            try:
                with open(fs_cache_path, 'r') as f:
                    fs_cached_response = f.read().strip()
                    elapsed = (time.time() - start_time) * 1000  # ms
                    logger.info(f"⚡ INSTANT cache hit: {elapsed:.2f}ms")
                    return fs_cached_response
            except Exception as e:
                logger.warning(f"Error reading from file cache: {str(e)}")
        
        # Check in-memory cache
        cached_response = response_cache.get(cache_key)
        if cached_response is not None:
            elapsed = (time.time() - start_time) * 1000  # ms
            logger.info(f"🚀 Memory cache hit: {elapsed:.2f}ms")
            return cached_response
        
        # Get model configuration
        model_config_path = os.environ.get("AI_MODEL_CONFIG_PATH", "config/model_config.json")
        config = {}
        try:
            with open(model_config_path, 'r') as f:
                config = json.load(f)
        except Exception as e:
            logger.warning(f"Error loading model config: {str(e)}. Using defaults.")
        
        # Create system prompt
        system_prompt = f"""You are KidsAsk.ai, a friendly and educational AI assistant for children. 
        You're currently answering questions about {topic}.
        
        Follow these guidelines:
        1. Always provide accurate information, but explain it in a way that's easy for children (age 5-12) to understand
        2. Use simple language and short sentences, but don't be condescending
        3. Be enthusiastic and encouraging
        4. Relate information to things kids might know about
        5. If you don't know something, admit it and suggest asking an adult or teacher
        6. Always keep answers appropriate for children
        7. Don't use complex technical jargon without explaining it
        8. Include fun facts when relevant
        9. Keep responses brief - about 3-5 sentences at most
        10. Do not discuss inappropriate topics, violence, or anything not suitable for children
        11. If asked about topics outside your knowledge area, gently redirect to a related aspect of {topic} that you can help with
        
        Remember, you're talking to a child who is curious about {topic}!"""
        
        # Prepare messages
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add history if available
        if history and len(history) > 0:
            # Limit history to last 3 exchanges to reduce token usage
            recent_history = history[-3:] if len(history) > 3 else history
            
            for msg in recent_history:
                if msg.get('role') in ['user', 'assistant'] and msg.get('content'):
                    messages.append({
                        "role": msg['role'],
                        "content": msg['content']
                    })
        
        # Add the current message
        messages.append({"role": "user", "content": message})
        
        # Call OpenAI API with retries
        retries = 0
        model = config.get('model_config', {}).get('default_model', DEFAULT_MODEL)
        
        while retries <= MAX_RETRIES:
            try:
                # Using the legacy approach for better compatibility
                response = openai.ChatCompletion.create(
                    model=model,
                    messages=messages,
                    max_tokens=300,
                    temperature=config.get('model_config', {}).get('temperature', 0.7),
                    top_p=config.get('model_config', {}).get('top_p', 0.9),
                    frequency_penalty=config.get('model_config', {}).get('frequency_penalty', 0.0),
                    presence_penalty=config.get('model_config', {}).get('presence_penalty', 0.6)
                )
                
                response_text = response.choices[0].message.content
                
                # Store in memory cache
                response_cache.put(cache_key, response_text)
                
                # Try to store in file system cache for ultra-fast retrieval next time
                try:
                    os.makedirs(os.path.dirname(fs_cache_path), exist_ok=True)
                    with open(fs_cache_path, 'w') as f:
                        f.write(response_text)
                except Exception as e:
                    logger.warning(f"Error writing to file cache: {str(e)}")
                
                # Log performance metrics
                elapsed_time = time.time() - start_time
                logger.info(f"Generated response for {topic} in {elapsed_time*1000:.2f}ms")
                
                return response_text
                
            except Exception as e:
                logger.warning(f"Attempt {retries+1}: OpenAI API error: {str(e)}")
                retries += 1
                if retries <= MAX_RETRIES:
                    time.sleep(1)  # Brief pause before retry
        
        # If we've exhausted all retries, return a fallback response
        logger.error(f"Failed to generate response after {MAX_RETRIES+1} attempts")
        return "I'm sorry, I'm having trouble thinking right now. Could you try asking me something else?"
                
    except Exception as e:
        logger.error(f"Error generating OpenAI response: {str(e)}")
        return "I'm sorry, I'm having trouble answering that right now. Could you ask me something else about this topic?"
