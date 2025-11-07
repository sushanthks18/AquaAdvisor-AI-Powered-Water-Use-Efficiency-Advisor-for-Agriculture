#!/bin/bash

echo "Starting build process..."

# Build frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Frontend build complete!"

# Backend will be handled by Vercel's Python runtime
echo "Backend will be served by Vercel Python runtime"

echo "Build process completed!"