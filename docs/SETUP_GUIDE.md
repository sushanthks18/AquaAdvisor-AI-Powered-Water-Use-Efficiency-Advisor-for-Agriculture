# Setup Guide

## Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- npm 8 or higher
- Git

## System Instructions

### Windows
1. Install Python from https://www.python.org/downloads/
2. Install Node.js from https://nodejs.org/
3. Install Git from https://git-scm.com/

### macOS
1. Install Homebrew if not already installed:
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
2. Install Python, Node.js, and Git:
   ```bash
   brew install python node git
   ```

### Linux (Ubuntu/Debian)
1. Update package list:
   ```bash
   sudo apt update
   ```
2. Install prerequisites:
   ```bash
   sudo apt install python3 python3-pip nodejs npm git
   ```

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

## API Keys

1. Obtain Sentinel Hub credentials:
   - Visit https://scihub.copernicus.eu/
   - Register for a free account
   - Note your username and password

2. Get an OpenWeatherMap API key:
   - Visit https://openweathermap.org/api
   - Register for a free account
   - Generate an API key

3. Create a `.env` file in the backend directory:
   ```bash
   cd backend
   cp .env.example .env
   ```

4. Edit the `.env` file and add your credentials:
   ```
   SENTINEL_USERNAME=your_sentinel_username
   SENTINEL_PASSWORD=your_sentinel_password
   OPENWEATHER_API_KEY=your_openweather_api_key
   FLASK_ENV=development
   ```

## Running the Application

### Starting the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

3. Start the Flask server:
   ```bash
   python app.py
   ```

   The backend will be available at http://localhost:5000

### Starting the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at http://localhost:3000

### Using the Start Script

For convenience, you can use the provided start script:

1. Make the script executable:
   ```bash
   chmod +x scripts/start.sh
   ```

2. Run the script:
   ```bash
   ./scripts/start.sh
   ```

## Troubleshooting

### Common Issues

1. **"Module not found" errors**:
   - Ensure you've activated the virtual environment
   - Verify all dependencies are installed with `pip install -r requirements.txt`

2. **Port already in use**:
   - Change the port in `app.py` (backend) or `vite.config.js` (frontend)
   - Or stop the process using the port:
     ```bash
     # Find process using port 5000
     lsof -i :5000
     # Kill the process
     kill -9 <PID>
     ```

3. **Permission denied**:
   - Ensure you have write permissions in the project directory
   - On Linux/macOS, you may need to use `sudo` for system-wide installations

4. **API authentication failures**:
   - Verify your credentials in the `.env` file
   - Check that your Sentinel Hub account is active
   - Ensure your OpenWeatherMap API key has the necessary permissions

### Development Tips

1. **Backend development**:
   - Use `FLASK_ENV=development` for auto-reload on code changes
   - Check logs in the terminal for error messages
   - Use the `/api/health` endpoint to verify services are working

2. **Frontend development**:
   - The Vite development server includes hot module replacement
   - Check the browser console for JavaScript errors
   - Use React DevTools for component debugging

## Production Deployment

### Backend Deployment

1. Set `FLASK_ENV=production` in your `.env` file
2. Use a production WSGI server like Gunicorn:
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

### Frontend Deployment

1. Build the production version:
   ```bash
   npm run build
   ```

2. Serve the `dist` directory using a web server like Nginx or Apache

### Docker Deployment

Alternatively, you can use the provided `docker-compose.yml` file:

```bash
docker-compose up -d
```

This will start both the backend and frontend services in separate containers.