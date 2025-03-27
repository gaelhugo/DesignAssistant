#!/bin/bash

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Start Flask server in the background
echo "Starting Flask server on port 5000..."
python server.py &
FLASK_PID=$!

# Start the web app
echo "Starting web application..."
npm run dev

# When the web app is terminated, also kill the Flask server
kill $FLASK_PID
