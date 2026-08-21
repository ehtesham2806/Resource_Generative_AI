from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import fitz  # PyMuPDF
from PIL import Image
import io
import base64
import os
from pathlib import Path
from typing import Optional, List
import logging
from dotenv import load_dotenv
from pydantic import BaseModel
from ocr_processor import detect_text_regions, apply_text_edits

# Load .env from backend directory or parent project directory
env_path_backend = Path(__file__).resolve().parent / ".env"
env_path_project = Path(__file__).resolve().parent.parent / ".env"

if env_path_backend.exists():
    load_dotenv(dotenv_path=env_path_backend)
elif env_path_project.exists():
    load_dotenv(dotenv_path=env_path_project)
else:
    load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="PDF Image Extractor API", version="1.0.0")

# Configure CORS
cors_env = os.getenv("CORS_ORIGINS", "http://localhost:5174,http://127.0.0.1:5174")
allowed_origins = [origin.strip() for origin in cors_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔥 Utility function to extract dominant color
def get_dominant_color(pil_image: Image.Image) -> str:
    small_image = pil_image.resize((50, 50))
    result = small_image.convert("RGB").getcolors(2500)
    if not result:
        return "#ffffff"
    dominant_color = max(result, key=lambda x: x[0])[1]
    return '#%02x%02x%02x' % dominant_color

@app.get("/")
async def root():
    return {"message": "PDF Image Extractor API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is working correctly"}

@app.post("/extract-pdf-image")
async def extract_pdf_image(file: UploadFile = File(...)):
    """
    Extract the first page of a PDF as a high-quality image
    """
    pdf_document = None
    try:
        # Validate file type
        if not file.content_type == "application/pdf":
            raise HTTPException(
                status_code=400, 
                detail="Invalid file type. Only PDF files are supported."
            )
        
        # Read the uploaded file
        pdf_content = await file.read()
        logger.info(f"Processing PDF file: {file.filename}, Size: {len(pdf_content)} bytes")
        
        # Open PDF with PyMuPDF - using more robust approach
        try:
            pdf_document = fitz.open(stream=pdf_content, filetype="pdf")
        except Exception as e:
            logger.error(f"Failed to open PDF document: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid or corrupted PDF file")
        
        # Check if PDF has pages
        try:
            page_count = len(pdf_document)  # More reliable way to get page count
            if page_count == 0:
                raise HTTPException(status_code=400, detail="PDF file contains no pages")
        except Exception as e:
            logger.error(f"Error getting page count: {str(e)}")
            raise HTTPException(status_code=400, detail="Unable to read PDF structure")
        
        # Get the first page
        try:
            first_page = pdf_document[0]
        except Exception as e:
            logger.error(f"Error accessing first page: {str(e)}")
            raise HTTPException(status_code=400, detail="Unable to access PDF first page")
        
        # Set high resolution for better quality (300 DPI)
        zoom = 300 / 72  # 72 is default DPI, 300 is target DPI
        matrix = fitz.Matrix(zoom, zoom)
        
        # Render page to pixmap (image)
        try:
            pixmap = first_page.get_pixmap(matrix=matrix)
        except Exception as e:
            logger.error(f"Error rendering page to pixmap: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to render PDF page")
        
        # Convert pixmap to PIL Image
        try:
            img_data = pixmap.tobytes("png")
            pil_image = Image.open(io.BytesIO(img_data))
        except Exception as e:
            logger.error(f"Error converting pixmap to image: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to convert PDF page to image")
        
        # Optimize image size while maintaining quality
        # Convert to RGB if necessary (removes alpha channel)
        if pil_image.mode in ("RGBA", "LA", "P"):
            background = Image.new("RGB", pil_image.size, (255, 255, 255))
            if pil_image.mode == "P":
                pil_image = pil_image.convert("RGBA")
            background.paste(pil_image, mask=pil_image.split()[-1] if pil_image.mode == "RGBA" else None)
            pil_image = background
        
        # 🔥 Extract dominant color from the image
        dominant_color = get_dominant_color(pil_image)
        
        # Resize if image is too large (max width: 1200px)
        max_width = 1200
        if pil_image.width > max_width:
            ratio = max_width / pil_image.width
            new_height = int(pil_image.height * ratio)
            pil_image = pil_image.resize((max_width, new_height), Image.Resampling.LANCZOS)
        
        # Convert to JPEG with high quality
        img_buffer = io.BytesIO()
        pil_image.save(img_buffer, format="JPEG", quality=92, optimize=True)
        img_buffer.seek(0)
        
        # Encode to base64
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        data_url = f"data:image/jpeg;base64,{img_base64}"
        
        logger.info(f"Successfully extracted first page from PDF: {file.filename}")
        
        return JSONResponse({
            "success": True,
            "message": "PDF first page extracted successfully",
            "image_data": data_url,
            "original_filename": file.filename,
            "page_count": page_count,
            "image_size": {
                "width": pil_image.width,
                "height": pil_image.height
            },
            "dominant_color": dominant_color
        })
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except fitz.FileDataError:
        raise HTTPException(status_code=400, detail="Invalid or corrupted PDF file")
    except Exception as e:
        logger.error(f"Unexpected error processing PDF {file.filename}: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to process PDF: {str(e)}"
        )
    finally:
        # Always close the PDF document to free resources
        if pdf_document:
            try:
                pdf_document.close()
            except:
                pass

@app.post("/process-image")
async def process_image(file: UploadFile = File(...)):
    """
    Process and optimize uploaded images
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400, 
                detail="Invalid file type. Only image files are supported."
            )
        
        # Read the uploaded file
        image_content = await file.read()
        logger.info(f"Processing image file: {file.filename}, Size: {len(image_content)} bytes")
        
        # Open image with PIL
        pil_image = Image.open(io.BytesIO(image_content))
        
        # Convert to RGB if necessary
        if pil_image.mode in ("RGBA", "LA", "P"):
            background = Image.new("RGB", pil_image.size, (255, 255, 255))
            if pil_image.mode == "P":
                pil_image = pil_image.convert("RGBA")
            if pil_image.mode == "RGBA":
                background.paste(pil_image, mask=pil_image.split()[-1])
                pil_image = background

        # 🔥 Extract dominant color from image
        dominant_color = get_dominant_color(pil_image)
        
        # Resize if image is too large (max width: 1200px)
        max_width = 1200
        if pil_image.width > max_width:
            ratio = max_width / pil_image.width
            new_height = int(pil_image.height * ratio)
            pil_image = pil_image.resize((max_width, new_height), Image.Resampling.LANCZOS)
        
        # Convert to JPEG with high quality
        img_buffer = io.BytesIO()
        pil_image.save(img_buffer, format="JPEG", quality=92, optimize=True)
        img_buffer.seek(0)
        
        # Encode to base64
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        data_url = f"data:image/jpeg;base64,{img_base64}"
        
        logger.info(f"Successfully processed image: {file.filename}")
        
        return JSONResponse({
            "success": True,
            "message": "Image processed successfully",
            "image_data": data_url,
            "original_filename": file.filename,
            "image_size": {
                "width": pil_image.width,
                "height": pil_image.height
            },
            "dominant_color": dominant_color
        })
        
    except Exception as e:
        logger.error(f"Error processing image {file.filename}: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to process image: {str(e)}"
        )

class OCRDetectRequest(BaseModel):
    image_data: str  # base64 data url or string

@app.post("/detect-ocr")
async def detect_ocr(request: OCRDetectRequest):
    """
    Detect text regions asynchronously via OCR
    """
    try:
        if ',' in request.image_data:
            _, encoded = request.image_data.split(",", 1)
        else:
            encoded = request.image_data
            
        image_bytes = base64.b64decode(encoded)
        pil_image = Image.open(io.BytesIO(image_bytes))
        
        # Run OCR detection
        ocr_results = detect_text_regions(pil_image)
        
        return JSONResponse({
            "success": True,
            "message": "OCR text detected successfully",
            "ocr_results": ocr_results
        })
    except Exception as e:
        logger.error(f"Error during OCR detection: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to detect text: {str(e)}")

class TextEditItem(BaseModel):
    id: str
    box: List[List[int]]
    action: str  # "remove" or "replace"
    new_text: Optional[str] = ""
    original_text: Optional[str] = ""
    angle: Optional[float] = 0.0
    color: Optional[List[int]] = [0, 0, 0]
    width: Optional[int] = 0
    height: Optional[int] = 0

class ImageEditRequest(BaseModel):
    image_data: str  # base64 string
    edits: List[TextEditItem]

@app.post("/edit-image-text")
async def edit_image_text(request: ImageEditRequest):
    try:
        # Decode base64 image
        if ',' in request.image_data:
            header, encoded = request.image_data.split(",", 1)
        else:
            encoded = request.image_data
            
        image_bytes = base64.b64decode(encoded)
        pil_image = Image.open(io.BytesIO(image_bytes))
        
        # Apply the edits
        processed_pil = apply_text_edits(pil_image, [edit.model_dump() for edit in request.edits])
        
        # Save to buffer as JPEG
        img_buffer = io.BytesIO()
        processed_pil.save(img_buffer, format="JPEG", quality=92, optimize=True)
        img_buffer.seek(0)
        
        # Encode to base64
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        data_url = f"data:image/jpeg;base64,{img_base64}"
        
        return JSONResponse({
            "success": True,
            "message": "Image text edited successfully",
            "image_data": data_url
        })
    except Exception as e:
        logger.error(f"Error in edit_image_text endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to edit image text: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", 8001))
    uvicorn.run(app, host=host, port=port, reload=True)