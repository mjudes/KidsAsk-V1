'use client';

import { useState } from 'react';
import { Topic } from '../types';

interface TopicSelectorProps {
  topics: Topic[];
  onSelectTopic: (topicId: number) => void;
}

export default function TopicSelector({ topics, onSelectTopic }: TopicSelectorProps) {
  const [hoveredTopic, setHoveredTopic] = useState<number | null>(null);
  
  // Get customized icon based on topic name to match mockup
  const getCustomIcon = (topicName: string, defaultIcon: string): string => {
    switch(topicName) {
      case 'Animals':
        return '🦁';
      case 'Space and Planets':
        return '🚀';
      case 'The Human Body':
        return '❤️';
      case 'Dinosaurs':
        return '🦕';
      case 'Weather and Natural Phenomena':
        return '🌈';
      case 'Sports':
        return '⚽';
      case 'Technology and Robots':
        return '🤖';
      case 'The Ocean':
        return '🌊';
      case 'Mythical Creatures and Magic':
        return '🐉';
      case 'Everyday Why Questions':
        return '❓';
      case 'Math':
        return '🔢';
      case 'Gaming':
        return '🎮';
      default:
        return defaultIcon;
    }
  };
  
  // Get topic description based on topic name
  const getTopicDescription = (topicName: string): string => {
    switch(topicName) {
      case 'Animals':
        return 'Learn about different animals and their habitats';
      case 'Space and Planets':
        return 'Explore the universe and learn about planets';
      case 'The Human Body':
        return 'Discover how our bodies work';
      case 'Dinosaurs':
        return 'Travel back in time to learn about dinosaurs';
      case 'Weather and Natural Phenomena':
        return 'Understand weather and natural events';
      case 'Sports':
        return 'Learn about different sports and how to play them';
      case 'Technology and Robots':
        return 'Explore technology and how things work';
      case 'The Ocean':
        return 'Dive into ocean life and marine biology';
      case 'Mythical Creatures and Magic':
        return 'Learn about mythical creatures and legends';
      case 'Everyday Why Questions':
        return 'Get answers to common questions about daily life';
      case 'Math':
        return 'Explore numbers, shapes, and fun math puzzles';
      case 'Gaming':
        return 'Learn about popular video games, tips, and gaming facts';
      default:
        return 'Explore this interesting topic!';
    }
  };
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {topics.map((topic) => (
        <div
          key={topic.id}
          className="bg-white rounded-lg p-6 text-center cursor-pointer hover:shadow-md transition-all duration-300 border border-gray-100 transform hover:scale-[1.03] hover:border-blue-200"
          onClick={() => onSelectTopic(topic.id)}
          onMouseEnter={() => setHoveredTopic(topic.id)}
          onMouseLeave={() => setHoveredTopic(null)}
        >
          <div className={`text-4xl mb-3 transition-transform duration-300 ${hoveredTopic === topic.id ? 'transform scale-125' : ''}`}>{getCustomIcon(topic.name, topic.icon)}</div>
          <h3 className="font-medium text-lg mb-1">{topic.name}</h3>
          <p className="text-xs text-gray-500 leading-snug">{getTopicDescription(topic.name)}</p>
        </div>
      ))}
    </div>
  );
}
