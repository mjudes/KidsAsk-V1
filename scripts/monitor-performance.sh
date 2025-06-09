#!/bin/bash

# Performance monitoring script for KidsAsk-V1
# Monitors AI service response times and cache performance

echo "Starting KidsAsk AI Performance Monitor"
echo "======================================="

# Function to get health metrics from AI service
function get_health_metrics {
    curl -s http://localhost:5050/health | jq .
}

# Function to test response time with a simple question
function test_response_time {
    local topic_id=$1
    local question=$2
    
    echo "Testing question: $question (Topic ID: $topic_id)"
    
    # Measure response time
    start_time=$(date +%s.%N)
    
    curl -s -X POST http://localhost:4000/api/chat \
      -H "Content-Type: application/json" \
      -d "{\"message\":\"$question\", \"topicId\":$topic_id}" > /dev/null
    
    end_time=$(date +%s.%N)
    execution_time=$(echo "$end_time - $start_time" | bc)
    echo "  Response time: ${execution_time}s"
    
    # Add a small delay between requests
    sleep 1
}

# Check if AI service is running
if ! curl -s http://localhost:5050/health > /dev/null; then
    echo "Error: AI service is not running"
    exit 1
fi

# Display initial health metrics
echo "Current health metrics:"
get_health_metrics
echo ""

# Run performance tests with various questions
echo "Running performance tests..."
echo "First request (cold start):"
test_response_time 1 "How do elephants sleep?"

echo "Testing cached response:"
test_response_time 1 "How do elephants sleep?"

echo "Testing different topics:"
test_response_time 2 "How far is Mars from Earth?"
test_response_time 3 "Why does my heart beat?"
test_response_time 4 "What did T-Rex eat?"
test_response_time 10 "Why is the sky blue?"

# Display final health metrics
echo ""
echo "Updated health metrics after tests:"
get_health_metrics

echo ""
echo "Performance monitoring complete"
echo "If response times are consistently above 10ms, consider further optimizations"
