from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import fitz  # PyMuPDF
from PIL import Image
import io
import base64
import os
from typing import Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="PDF Image Extractor API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
            }
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
        if not file.content_type.startswith("image/"):
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
            }
        })
        
    except Exception as e:
        logger.error(f"Error processing image {file.filename}: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to process image: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)