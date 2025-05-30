#!/bin/bash
# Ollama Performance Monitoring Script

echo "=========================================="
echo "Ollama AI Performance Monitor"
echo "=========================================="

# Check if Ollama service is running
if ! docker ps | grep -q "ollama-service"; then
  echo "❌ Ollama service is not running. Please start it with: docker compose up -d"
  exit 1
fi

# Define test questions
QUESTIONS=(
  "Why is the sky blue?"
  "How do dinosaurs become fossils?"
  "What is inside our bodies?"
  "Why do seasons change?"
  "How do computers work?"
)

TOPICS=(
  "Weather and Natural Phenomena"
  "Dinosaurs"
  "The Human Body"
  "Weather and Natural Phenomena"
  "Technology and Robots"
)

# Function to measure response time
measure_response_time() {
  local question="$1"
  local topic="$2"
  
  echo -e "\nTesting question: \"$question\" (Topic: $topic)"
  
  # Start time measurement
  start_time=$(date +%s.%N)
  
  # Send request to Ollama API
  response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"message\":\"$question\",\"topic\":\"$topic\",\"history\":[]}" \
    http://localhost:5050/generate)
  
  # End time measurement
  end_time=$(date +%s.%N)
  
  # Calculate elapsed time
  elapsed=$(echo "$end_time - $start_time" | bc)
  
  # Check if we got a valid response
  if [[ $response == *"response"* ]]; then
    # Extract just the response text
    answer=$(echo $response | sed 's/.*"response":"\([^"]*\)".*/\1/' | cut -c 1-100)
    echo "Response: \"${answer}...\" (truncated)"
    echo "Response time: ${elapsed} seconds"
    return 0
  else
    echo "❌ Failed to get response"
    echo "Raw response: $response"
    return 1
  fi
}

# Run performance test
echo "Running performance test with ${#QUESTIONS[@]} questions..."
echo "This will measure the response time for each question."

total_time=0
success_count=0

for i in "${!QUESTIONS[@]}"; do
  question="${QUESTIONS[$i]}"
  topic="${TOPICS[$i]}"
  
  # Measure response time
  measure_response_time "$question" "$topic"
  
  if [ $? -eq 0 ]; then
    total_time=$(echo "$total_time + $elapsed" | bc)
    success_count=$((success_count + 1))
  fi
done

# Calculate average time if we had successful responses
if [ $success_count -gt 0 ]; then
  average_time=$(echo "scale=2; $total_time / $success_count" | bc)
  echo -e "\n=========================================="
  echo "Performance Summary"
  echo "=========================================="
  echo "Total questions: ${#QUESTIONS[@]}"
  echo "Successful responses: $success_count"
  echo "Average response time: ${average_time} seconds"
  
  # Provide performance assessment
  if (( $(echo "$average_time < 1.0" | bc -l) )); then
    echo -e "\n✅ Excellent performance! Response time is very fast."
  elif (( $(echo "$average_time < 3.0" | bc -l) )); then
    echo -e "\n✅ Good performance. Response time is acceptable."
  elif (( $(echo "$average_time < 5.0" | bc -l) )); then
    echo -e "\n⚠️ Moderate performance. Consider optimizing settings with ./ollama-tune.sh"
  else
    echo -e "\n⚠️ Slow performance. Run ./ollama-tune.sh to optimize for your MacBook Pro."
  fi
else
  echo -e "\n❌ Could not measure performance. All requests failed."
fi

echo -e "\n=========================================="
