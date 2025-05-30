import os
import logging
import requests
import json
from flask import Flask, request, jsonify
from dotenv import load_dotenv

# Load environment variables (if any)
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("ollama_service.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("ollama-service")

# Initialize Flask app
app = Flask(__name__)

# Ollama API settings
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "localhost")
OLLAMA_PORT = os.getenv("OLLAMA_PORT", "11434")
OLLAMA_BASE_URL = f"http://{OLLAMA_HOST}:{OLLAMA_PORT}"
MODEL_NAME = os.getenv("OLLAMA_MODEL", "tinyllama")

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    try:
        # Check if Ollama API is up
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags")
        if response.status_code == 200:
            return jsonify({"status": "ok", "models": response.json()})
        else:
            return jsonify({"status": "error", "message": "Ollama API not responding properly"}), 500
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/generate', methods=['POST'])
def generate():
    """Generate a response to a kid's question using Ollama"""
    try:
        data = request.get_json()
        
        if not data:
            logger.error("Invalid request: No JSON data provided")
            return jsonify({"error": "No data provided"}), 400
        
        message = data.get('message')
        topic = data.get('topic')
        history = data.get('history', [])
        
        if not message:
            logger.error("Invalid request: No message provided")
            return jsonify({"error": "No message provided"}), 400
        
        if not topic:
            logger.error("Invalid request: No topic provided")
            return jsonify({"error": "No topic provided"}), 400

        # Construct the prompt including topic and history
        prompt = f"Topic: {topic}\nQuestion: {message}\n\n"
        
        # Include chat history if available
        if history:
            conversation = "Previous conversation:\n"
            for msg in history[-3:]:  # Only include the last 3 messages to keep context short
                role = "Kid" if msg['role'] == 'user' else "KidsAsk"
                conversation += f"{role}: {msg['content']}\n"
            prompt = conversation + "\n" + prompt

        # Call Ollama API
        payload = {
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
                "top_k": 40,
                "num_ctx": 2048
            }
        }
        
        logger.info(f"Sending request to Ollama: {json.dumps(payload)}")
        response = requests.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload)
        
        if response.status_code == 200:
            response_data = response.json()
            generated_text = response_data.get('response', '')
            
            # Log and return the response
            logger.info(f"Generated response for topic '{topic}': {generated_text[:100]}...")
            return jsonify({
                "response": generated_text,
                "topic": topic
            })
        else:
            error_msg = f"Ollama API error: {response.status_code} - {response.text}"
            logger.error(error_msg)
            return jsonify({"error": error_msg}), 500
            
    except Exception as e:
        error_msg = f"Error generating response: {str(e)}"
        logger.error(error_msg)
        return jsonify({"error": error_msg}), 500

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    
    logger.info(f"Starting Ollama service on port {port} with debug={debug}")
    app.run(host='0.0.0.0', port=port, debug=debug)
