import io
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from u2net_predictor import U2NETPredictor
from PIL import Image
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Background Remover API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize predictor
try:
    predictor = U2NETPredictor()
    logger.info("U²-Net predictor initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize U²-Net predictor: {e}")
    predictor = None

@app.get("/")
async def root():
    return {"message": "Background Remover API is running"}

@app.get("/health")
async def health_check():
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return {"status": "healthy", "model": "loaded"}

@app.post("/remove-bg/")
async def remove_bg(file: UploadFile = File(...)):
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Please check server logs.")
    
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read and validate image
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # Process image
        result = predictor.remove_bg(image)
        
        # Return result
        buf = io.BytesIO()
        result.save(buf, format="PNG")
        buf.seek(0)
        
        logger.info(f"Successfully processed image: {file.filename}")
        return StreamingResponse(buf, media_type="image/png")
        
    except Exception as e:
        logger.error(f"Error processing image {file.filename}: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")
