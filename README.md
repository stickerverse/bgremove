# U²-Net Background Remover

A full-stack web application that removes backgrounds from images using the U²-Net deep learning model. Features a FastAPI backend with a modern, responsive HTML/JS frontend.

## ✨ Features

- **AI-Powered**: Uses U²-Net deep learning model for high-quality background removal
- **Fast Processing**: Optimized for quick image processing
- **Modern UI**: Beautiful, responsive web interface
- **Real-time Feedback**: Loading states and error handling
- **Cross-platform**: Works on Windows, macOS, and Linux

## 🚀 Quick Start

### Option 1: Using the startup script (Recommended)

```bash
# Make the script executable (first time only)
chmod +x start_app.sh

# Start the app
./start_app.sh
```

### Option 2: Manual setup

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
Open `frontend/index.html` in your browser.

## 🌐 Access Points

- **Frontend**: `frontend/index.html` (open in browser)
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 📋 Requirements

- Python 3.8+
- pip3
- Internet connection (for first-time model download)

## 📦 Dependencies

### Backend
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `torch` - PyTorch for deep learning
- `torchvision` - Computer vision utilities
- `pillow` - Image processing
- `numpy` - Numerical computing
- `huggingface-hub` - Model downloading

## 🔧 How It Works

1. **Model Loading**: On first run, the U²-Net model is automatically downloaded from Hugging Face
2. **Image Upload**: Users upload images through the web interface
3. **Background Removal**: The AI model processes the image and removes the background
4. **Result Display**: The processed image is displayed with a transparent background

## 🎯 API Endpoints

- `POST /remove-bg/` - Remove background from uploaded image
- `GET /health` - Check server and model status
- `GET /docs` - Interactive API documentation

## 🐛 Troubleshooting

### Common Issues

1. **Port 8000 already in use**
   ```bash
   lsof -ti:8000 | xargs kill -9
   ```

2. **Model download fails**
   - Check internet connection
   - Ensure you have sufficient disk space
   - Try running the app again

3. **Import errors**
   - Ensure you're in the `backend` directory when starting the server
   - Verify all dependencies are installed: `pip install -r requirements.txt`

### First Run Notes

- The first startup may take several minutes as the U²-Net model (~176MB) downloads
- Subsequent startups will be much faster as the model is cached locally
- The model is cached in `backend/model_cache/` directory

## 🎨 Customization

### Styling
- Modify `frontend/style.css` to change the appearance
- Update `frontend/index.html` for layout changes

### Backend
- Edit `backend/app.py` to modify API behavior
- Adjust `backend/u2net_predictor.py` for model configuration

## 📱 Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- [U²-Net](https://github.com/xuebinqin/U-2-Net) - The deep learning model
- [FastAPI](https://fastapi.tiangolo.com/) - Modern web framework
- [Hugging Face](https://huggingface.co/) - Model hosting platform
