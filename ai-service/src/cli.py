#!/usr/bin/env python
# filepath: /Users/meronj/meron-dev-projects/KidsAsk-V1/ai-service/src/cli.py

import argparse
import os
import json
import sys
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def main():
    parser = argparse.ArgumentParser(description='Test Ollama model from command line')
    parser.add_argument('query', help='The question to ask the model')
    parser.add_argument('--model', default=os.environ.get('OLLAMA_MODEL', 'gemma:2b'), 
                        help='Ollama model to use (default: gemma:2b)')
    parser.add_argument('--host', default=os.environ.get('OLLAMA_API_HOST', 'http://localhost:11434'),
                        help='Ollama API host (default: http://localhost:11434)')
    
    args = parser.parse_args()
    
    try:
        # Call Ollama API
        response = requests.post(
            f"{args.host}/api/generate",
            json={
                "model": args.model,
                "prompt": args.query,
                "stream": False
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"\nQuestion: {args.query}")
            print(f"\nAnswer: {result.get('response', '')}")
        else:
            print(f"Error: {response.status_code} - {response.text}")
            sys.exit(1)
    
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
