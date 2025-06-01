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
RUN pip install openai gunicorn

# Copy the rest of the application
COPY . .

# Make sure we set PYTHONPATH correctly
ENV PYTHONPATH=/app
ENV FLASK_APP=src/app.py
ENV FLASK_ENV=production

# Create directory for logs
RUN mkdir -p logs

# Expose the port the app runs on
EXPOSE 5050

# Command to run the application with gunicorn for better performance
CMD ["gunicorn", "--bind", "0.0.0.0:5050", "--workers", "1", "--threads", "4", "--timeout", "20", "src.app:app"]
