import os
import logging
import sys
import time
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import threading

# Add the current directory to Python path to fix import issues
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.services.ollama_service import generate_ollama_response, response_cache
from src.utils.content_filter import filter_inappropriate_content
from src.utils.topic_validator import validate_topic
from src.utils.logger_config import setup_logger

# Load environment variables
load_dotenv()

# Setup logging
logger = setup_logger()

# Initialize Flask app
app = Flask(__name__)

# Preload the model by sending a dummy request in the background
def preload_model():
    try:
        # Simple preload question to warm up the model
        generate_ollama_response("What is the sky blue?", "Everyday Why Questions")
        logger.info("Model preloaded successfully")
    except Exception as e:
        logger.error(f"Error preloading model: {str(e)}")

# Start preloading in background thread
threading.Thread(target=preload_model).start()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint with performance metrics"""
    # Get cache stats if available
    cache_stats = {}
    if hasattr(response_cache, 'get_stats'):
        cache_stats = response_cache.get_stats()
    
    return jsonify({
        "status": "ok",
        "timestamp": time.time(),
        "cache_stats": cache_stats,
        "model": os.environ.get("OLLAMA_MODEL", "gemma:2b")
    })

@app.route('/generate', methods=['POST'])
def generate():
    """Generate a response to a kid's question"""
    start_time = time.time()
    try:
        data = request.get_json()
        
        if not data:
            logger.error("Invalid request: No JSON data provided")
            return jsonify({"error": "No data provided"}), 400
        
        message = data.get('message')
        topic = data.get('topic')
        history = data.get('history', [])
        
        # Basic validation
        if not message:
            logger.error("Invalid request: No message provided")
            return jsonify({"error": "No message provided"}), 400
        
        if not topic:
            logger.error("Invalid request: No topic provided")
            return jsonify({"error": "No topic provided"}), 400
        
        # Limit message length to reduce processing time
        if len(message) > 500:
            message = message[:500]
        
        # Limit history to last 3 exchanges to reduce context size
        if history and len(history) > 3:
            history = history[-3:]
        
        # Check if the topic is in our allowed topics
        if not validate_topic(topic):
            logger.warning(f"Invalid topic requested: {topic}")
            return jsonify({
                "error": "Invalid topic",
                "response": "I can only answer questions about Animals, Space and Planets, The Human Body, Dinosaurs, Weather, Sports, Technology and Robots, The Ocean, Mythical Creatures and Magic, Everyday Why Questions, Math, and Lego."
            }), 400
        
        # Check for inappropriate content
        is_appropriate, filter_message = filter_inappropriate_content(message)
        
        if not is_appropriate:
            logger.warning(f"Inappropriate content detected: {message}")
            return jsonify({
                "response": "I'm sorry, but I can't answer that question. Let's talk about something else! You can ask me about animals, space, dinosaurs, and many other fun topics!"
            })
        
        # Generate response
        response = generate_ollama_response(message, topic, history)
        
        # Log timing information
        elapsed_time = time.time() - start_time
        logger.info(f"Request processed in {elapsed_time:.2f} seconds")
        
        return jsonify({
            "response": response
        })
        
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return jsonify({
            "error": "An error occurred while processing your request",
            "response": "I'm sorry, I'm having trouble answering that right now. Could you try asking me something else?"
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5050))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get("FLASK_DEBUG", "False").lower() == "true")
