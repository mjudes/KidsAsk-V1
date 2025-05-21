'use client';

import { useState } from 'react';
import { Topic } from '../types';

interface TopicSelectorProps {
  topics: Topic[];
  onSelectTopic: (topicId: number) => void;
}

export default function TopicSelector({ topics, onSelectTopic }: TopicSelectorProps) {
  const [hoveredTopic, setHoveredTopic] = useState<number | null>(null);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {topics.map((topic) => (
        <div
          key={topic.id}
          className={`topic-card ${hoveredTopic === topic.id ? 'border-blue-500 scale-105' : ''}`}
          onClick={() => onSelectTopic(topic.id)}
          onMouseEnter={() => setHoveredTopic(topic.id)}
          onMouseLeave={() => setHoveredTopic(null)}
        >
          <div className="text-4xl mb-2">{topic.icon}</div>
          <h3 className="font-bold text-lg">{topic.name}</h3>
        </div>
      ))}
    </div>
  );
}
