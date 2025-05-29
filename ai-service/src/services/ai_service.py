import os
import logging
import json
import requests
import ollama
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import logger
from utils.logger_config import setup_logger
logger = setup_logger()

# Configure Ollama host
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://ollama:11434")

def generate_response(message, topic, history=None):
    """
    Generate a kid-friendly response based on the message and topic using Ollama.
    
    Args:
        message (str): The question or message from the user
        topic (str): The topic category (e.g., "Animals", "Space")
        history (list): Previous conversation history
        
    Returns:
        str: AI-generated response
    """
    try:
        if history is None:
            history = []
            
        # Convert history to the format expected by Ollama API
        formatted_history = []
        for msg in history:
            if msg['role'] in ['user', 'assistant']:
                formatted_history.append({
                    "role": msg['role'],
                    "content": msg['content']
                })
        
        # System message to guide the AI
        system_message = f"""You are KidsAsk.ai, a friendly and educational AI assistant for children. 
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
        
        Remember, you're talking to a child who is curious about {topic}!
        """
        
        # Set up the model (default to llama2)
        model = os.environ.get("OLLAMA_MODEL", "llama2")
        
        # Call Ollama API
        try:
            # Try using the ollama Python client first
            messages = [{"role": "system", "content": system_message}]
            messages.extend(formatted_history)
            messages.append({"role": "user", "content": message})
            
            response = ollama.chat(
                model=model,
                messages=messages,
                options={
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "num_predict": 300,
                    "num_ctx": 2048
                }
            )
            
            return response['message']['content']
            
        except (ImportError, Exception) as e:
            logger.warning(f"Failed to use ollama Python client: {str(e)}. Falling back to REST API.")
            
            # Fallback to direct REST API call
            ollama_url = f"{OLLAMA_HOST}/api/chat"
            headers = {"Content-Type": "application/json"}
            payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": system_message},
                    *formatted_history,
                    {"role": "user", "content": message}
                ],
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "num_predict": 300,
                    "num_ctx": 2048
                }
            }
            
            response = requests.post(ollama_url, headers=headers, json=payload)
            response.raise_for_status()
            return response.json()['message']['content']
    
    except Exception as e:
        logger.error(f"Error generating AI response: {str(e)}")
        return "I'm sorry, I'm having trouble thinking of an answer right now. Could you ask me something else about this topic?"
