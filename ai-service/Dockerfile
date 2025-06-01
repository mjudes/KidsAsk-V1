FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install openai

# Copy the rest of the application
COPY . .

<<<<<<< HEAD
# Set Python path for module imports
=======
# Make sure we set PYTHONPATH correctly
>>>>>>> ai-branch-new-container
ENV PYTHONPATH=/app

# Expose the port the app runs on
EXPOSE 5050

# Command to run the application
CMD ["python", "src/app.py"]
