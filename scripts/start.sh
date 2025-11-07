#!/bin/bash

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Error: .env file not found. Please create .env file with your API credentials."
    echo "You can copy .env.example to .env and fill in your credentials."
    exit 1
fi

# Function to clean up background processes
cleanup() {
    echo "Stopping background processes..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID
    fi
    exit 0
}

# Trap Ctrl+C and call cleanup function
trap cleanup INT TERM

# Start backend
echo "Starting backend server..."
cd backend
# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi
python app.py &
BACKEND_PID=$!
cd ..

# Start frontend
echo "Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Servers started successfully!"
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo "Press Ctrl+C to stop both servers."

# Wait for both processes
wait $BACKEND_PID
wait $FRONTEND_PID