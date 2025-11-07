#!/bin/bash

echo "Setting up frontend environment..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
else
    echo "Node.js dependencies already installed."
fi

echo "Frontend setup complete!"
echo "To start the development server, run: npm run dev"