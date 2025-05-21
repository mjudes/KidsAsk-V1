import re
import logging
from src.utils.logger_config import setup_logger

logger = setup_logger()

# Keywords that might indicate inappropriate content
INAPPROPRIATE_KEYWORDS = [
    'sex', 'sexy', 'naked', 'nude', 'porn', 'pornography', 'kill', 'killing',
    'murder', 'drug', 'cocaine', 'heroin', 'meth', 'methamphetamine', 'suicide',
    'die', 'death', 'weapon', 'gun', 'bomb', 'terror', 'terrorist', 'fuck',
    'shit', 'damn', 'ass', 'hell', 'bitch', 'cunt', 'dick', 'penis', 'vagina',
    'nsfw', 'adult', 'xxx'
]

def filter_inappropriate_content(message):
    """
    Check if the message contains inappropriate content.
    
    Args:
        message (str): The message to check
        
    Returns:
        tuple: (is_appropriate, filter_message)
            - is_appropriate (bool): True if message is appropriate, False otherwise
            - filter_message (str): Message explaining why content was filtered, if applicable
    """
    # Convert to lowercase for case-insensitive matching
    message_lower = message.lower()
    
    # Check for inappropriate keywords
    for keyword in INAPPROPRIATE_KEYWORDS:
        # Use word boundaries to match whole words only
        pattern = r'\b' + re.escape(keyword) + r'\b'
        if re.search(pattern, message_lower):
            logger.warning(f"Inappropriate content detected with keyword: {keyword}")
            return False, f"Content filtered due to inappropriate keyword: {keyword}"
    
    # All checks passed
    return True, "Content is appropriate"
