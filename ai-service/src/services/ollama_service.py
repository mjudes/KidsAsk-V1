import os
import logging
import json
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import logger
from src.utils.logger_config import setup_logger
logger = setup_logger()

# Ollama configuration
OLLAMA_API_HOST = os.environ.get("OLLAMA_API_HOST", "http://ollama:11434")
DEFAULT_MODEL = os.environ.get("OLLAMA_MODEL", "gemma:2b")

def generate_ollama_response(message, topic, history=None):
    """
    Generate a kid-friendly response using Ollama models based on the message and topic.
    
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
            
        # Get model configuration
        model_config_path = os.environ.get("AI_MODEL_CONFIG_PATH", "config/model_config.json")
        with open(model_config_path, 'r') as f:
            config = json.load(f)
        
        # Find system prompt for the topic
        system_prompt = ""
        for topic_config in config.get('topics', []):
            if topic_config.get('name', '').lower() == topic.lower():
                system_prompt = topic_config.get('system_prompt', '')
                break
        
        # If no specific topic prompt found, use a generic one
        if not system_prompt:
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
            12. Pay attention to the conversation history and connect your answers to previous questions when relevant
            13. If a question builds on a previous answer (like "and in a day?" after asking about per minute), use the previous information to calculate or reason through the new question
            14. Show your thinking process in simple terms when doing calculations or reasoning
            
            Remember, you're talking to a child who is curious about {topic}!
            """
        
        # Build conversation history for context
        formatted_history = []
        for msg in history:
            if msg['role'] in ['user', 'assistant']:
                formatted_history.append({
                    "role": msg['role'],
                    "content": msg['content']
                })
        
        # Format prompt with system message and history
        prompt = system_prompt + "\n\n"
        
        # Add conversation context if there's history
        if formatted_history:
            prompt += "Previous conversation:\n"
            for msg in formatted_history:
                if msg['role'] == 'user':
                    prompt += f"Child: {msg['content']}\n"
                else:
                    prompt += f"You: {msg['content']}\n"
            prompt += "\n"
        
        # Add instructions for handling follow-up questions
        prompt += "Important: If the current question seems to be a follow-up (like 'and in a day?' or 'what about...?'), "
        prompt += "make sure to connect it to your previous answer and show your reasoning step by step.\n\n"
        
        # Add the current message
        prompt += f"Child: {message}\nYou:"
        
        # Call Ollama API
        model = config.get('model_config', {}).get('default_model', DEFAULT_MODEL)
        if "gpt" in model:  # If the config still has OpenAI models
            model = DEFAULT_MODEL
            
        try:
            response = requests.post(
                f"{OLLAMA_API_HOST}/api/generate",
                json={
                    "model": model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": config.get('model_config', {}).get('temperature', 0.7),
                        "top_p": config.get('model_config', {}).get('top_p', 0.9),
                        "max_tokens": config.get('model_config', {}).get('max_tokens', 300)
                    }
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get('response', '')
            else:
                logger.error(f"Ollama API error: {response.status_code} - {response.text}")
                # Fall back to a simpler request if options aren't supported
                response = requests.post(
                    f"{OLLAMA_API_HOST}/api/generate",
                    json={
                        "model": model,
                        "prompt": prompt,
                        "stream": False
                    },
                    timeout=30
                )
                if response.status_code == 200:
                    result = response.json()
                    return result.get('response', '')
                else:
                    raise Exception(f"Ollama API error: {response.status_code} - {response.text}")
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Error connecting to Ollama API: {str(e)}")
            raise
    
    except Exception as e:
        logger.error(f"Error generating Ollama response: {str(e)}")
        return "I'm sorry, I'm having trouble thinking of an answer right now. Could you ask me something else about this topic?"
