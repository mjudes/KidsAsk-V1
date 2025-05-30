import logging

def validate_topic(topic):
    """
    Validate that a topic is in our allowed list.
    
    Args:
        topic (str): The topic to validate
        
    Returns:
        bool: True if topic is valid, False otherwise
    """
    # List of allowed topics
    allowed_topics = [
        "Animals",
        "Space and Planets",
        "The Human Body",
        "Dinosaurs",
        "Weather and Natural Phenomena",
        "Sports",
        "Teams Sports and Single Play Sports", # Alternative name for sports
        "Technology and Robots",
        "The Ocean",
        "Mythical Creatures and Magic",
        "Everyday Why Questions",
        "Math",
        "Lego"
    ]
    
    # Case-insensitive matching
    return any(t.lower() == topic.lower() for t in allowed_topics)
