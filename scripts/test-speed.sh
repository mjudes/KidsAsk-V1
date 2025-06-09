#!/bin/bash
# Ultra-fast response test for KidsAsk
# Tests speed of cached responses
# Created on June 1, 2025

echo "Testing KidsAsk response time..."

# Make sure cache is set up
if [ ! -d "/tmp/kidsask-cache" ]; then
    echo "Setting up cache first..."
    ./instant-cache.sh
fi

# Send a request to the heart question (which should be cached)
echo "Testing cached question: 'how big is the heart'"

# Time the request
START=$(date +%s%N)
curl -s -X POST http://localhost:5050/generate \
  -H "Content-Type: application/json" \
  -d '{
    "message": "how big is the heart",
    "topic": "Human Body"
  }' > /dev/null
END=$(date +%s%N)

# Calculate time in milliseconds
DIFF=$((($END - $START)/1000000))

echo "Response time: ${DIFF}ms"

if [ $DIFF -lt 10 ]; then
    echo "✅ ULTRA-FAST! Response time is less than 10ms"
else
    echo "❌ Response time is still too slow"
fi

echo ""
echo "Testing uncached question: 'what is the speed of light'"

# Time an uncached request
START=$(date +%s%N)
curl -s -X POST http://localhost:5050/generate \
  -H "Content-Type: application/json" \
  -d '{
    "message": "what is the speed of light",
    "topic": "Space and Planets"
  }' > /dev/null
END=$(date +%s%N)

# Calculate time in milliseconds 
DIFF=$((($END - $START)/1000000))

echo "Response time: ${DIFF}ms"
