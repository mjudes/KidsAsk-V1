import os
import logging
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from src.services.ai_service import generate_response
from src.utils.content_filter import filter_inappropriate_content
from src.utils.topic_validator import validate_topic
from src.utils.logger_config import setup_logger

# Load environment variables
load_dotenv()

# Setup logging
logger = setup_logger()

# Initialize Flask app
app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({"status": "ok"})

@app.route('/generate', methods=['POST'])
def generate():
    """Generate a response to a kid's question"""
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
        response = generate_response(message, topic, history)
        
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
