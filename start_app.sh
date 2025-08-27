#!/bin/bash

echo "🚀 Starting U²-Net Background Remover App..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if pip3 is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3 first."
    exit 1
fi

# Navigate to backend directory
cd "$(dirname "$0")/backend"

echo "📦 Installing/updating Python dependencies..."
python3 -m pip install -r requirements.txt

echo "🔧 Starting FastAPI backend server..."
echo "   Backend will be available at: http://localhost:8000"
echo "   API docs will be available at: http://localhost:8000/docs"
echo "   Health check will be available at: http://localhost:8000/health"
echo ""
echo "🌐 Frontend will be available at: frontend/index.html"
echo ""
echo "⚠️  Note: First startup may take several minutes to download the U²-Net model (~176MB)"
echo "   Subsequent startups will be much faster as the model is cached locally."
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the backend server
python3 -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
