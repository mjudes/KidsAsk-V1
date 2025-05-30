import os
import logging
import json
import requests
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure OpenAI
openai.api_key = os.environ.get("OPENAI_API_KEY")

# Import logger
from src.utils.logger_config import setup_logger
logger = setup_logger()

def generate_response(message, topic, history=None):
    """
    Generate a kid-friendly response based on the message and topic.
    
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
            
        # Convert history to the format expected by OpenAI API
        formatted_history = []
        for msg in history:
            if msg['role'] in ['user', 'assistant']:
                formatted_history.append({
                    "role": msg['role'],
                    "content": msg['content']
                })
        
        # System message to guide the AI
        system_message = {
            "role": "system",
            "content": f"""You are KidsAsk.ai, a friendly and educational AI assistant for children. 
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
        }
        
        # Add new user message
        user_message = {"role": "user", "content": message}
        
        # Combine system message, conversation history, and new user message
        messages = [system_message] + formatted_history + [user_message]
        
        # Call OpenAI API
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",  # or use gpt-4 for better responses
            messages=messages,
            max_tokens=300,
            temperature=0.7,
            top_p=0.9,
            frequency_penalty=0.0,
            presence_penalty=0.6
        )
        
        # Extract and return the assistant's message
        return response.choices[0].message.content
    
    except Exception as e:
        logger.error(f"Error generating AI response: {str(e)}")
        return "I'm sorry, I'm having trouble thinking of an answer right now. Could you ask me something else about this topic?"
