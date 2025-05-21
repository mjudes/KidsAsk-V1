FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port the app will run on
EXPOSE 4000

# Start the application
CMD ["npm", "start"]
