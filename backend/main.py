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
        
        # Extract native text blocks from the first page using PyMuPDF
        page_width_pts = float(first_page.rect.width)
        page_height_pts = float(first_page.rect.height)
        text_dict = first_page.get_text("dict")
        native_text_blocks = []
        block_idx = 0
        for block in text_dict.get("blocks", []):
            if block.get("type") == 0:  # Text block
                for line in block.get("lines", []):
                    spans = line.get("spans", [])
                    if not spans:
                        continue
                    full_text = "".join(span.get("text", "") for span in spans).strip()
                    if not full_text:
                        continue
                    first_span = spans[0]
                    bbox = line.get("bbox", first_span.get("bbox"))
                    x0, y0, x1, y1 = float(bbox[0]), float(bbox[1]), float(bbox[2]), float(bbox[3])
                    
                    x0 = max(0.0, min(page_width_pts, x0))
                    y0 = max(0.0, min(page_height_pts, y0))
                    x1 = max(0.0, min(page_width_pts, x1))
                    y1 = max(0.0, min(page_height_pts, y1))
                    
                    if x1 <= x0 or y1 <= y0:
                        continue
                        
                    color_int = first_span.get("color", 0)
                    r = (color_int >> 16) & 255
                    g = (color_int >> 8) & 255
                    b = color_int & 255
                    
                    native_text_blocks.append({
                        "id": f"pdf_txt_{block_idx}",
                        "text": full_text,
                        "pdf_rect": [x0, y0, x1, y1],
                        "font_size": float(first_span.get("size", 12.0)),
                        "font_name": str(first_span.get("font", "Helvetica")),
                        "flags": int(first_span.get("flags", 0)),
                        "color": [r, g, b],
                        "rel_box": {
                            "left": (x0 / page_width_pts) * 100.0,
                            "top": (y0 / page_height_pts) * 100.0,
                            "width": ((x1 - x0) / page_width_pts) * 100.0,
                            "height": ((y1 - y0) / page_height_pts) * 100.0
                        }
                    })
                    block_idx += 1

        has_native_text = len(native_text_blocks) > 0
        pdf_base64 = base64.b64encode(pdf_content).decode()

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
        
        logger.info(f"Successfully extracted first page from PDF: {file.filename}, has_native_text: {has_native_text}, spans: {len(native_text_blocks)}")
        
        return JSONResponse({
            "success": True,
            "message": "PDF first page extracted successfully",
            "image_data": data_url,
            "original_filename": file.filename,
            "page_count": page_count,
            "is_pdf": True,
            "has_native_text": has_native_text,
            "native_text_blocks": native_text_blocks,
            "pdf_data": pdf_base64,
            "page_size": {
                "width": page_width_pts,
                "height": page_height_pts
            },
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

class PDFTextEditItem(BaseModel):
    id: str
    pdf_rect: List[float]  # [x0, y0, x1, y1] in PDF points
    action: str  # "remove" or "replace"
    new_text: Optional[str] = ""
    original_text: Optional[str] = ""
    font_size: Optional[float] = 12.0
    font_name: Optional[str] = "helv"
    color: Optional[List[int]] = [0, 0, 0]

class PDFEditRequest(BaseModel):
    pdf_data: str  # base64 encoded PDF
    edits: List[PDFTextEditItem]
    page_index: Optional[int] = 0

@app.post("/edit-pdf-text")
async def edit_pdf_text(request: PDFEditRequest):
    """
    Apply native text removals and replacements directly on the PDF first page
    and re-render the page at 300 DPI.
    """
    pdf_doc = None
    try:
        # Decode base64 PDF
        if ',' in request.pdf_data:
            _, encoded = request.pdf_data.split(",", 1)
        else:
            encoded = request.pdf_data
            
        pdf_bytes = base64.b64decode(encoded)
        pdf_doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        if len(pdf_doc) == 0:
            raise HTTPException(status_code=400, detail="PDF contains no pages")
            
        page = pdf_doc[request.page_index]
        
        # Add redactions for all items (both remove and replace require erasing original text)
        for edit in request.edits:
            if not edit.pdf_rect or len(edit.pdf_rect) < 4:
                continue
            x0, y0, x1, y1 = edit.pdf_rect
            # Use exact text rectangle without opaque fill to preserve natural background color
            rect = fitz.Rect(x0, y0, x1, y1)
            page.add_redact_annot(rect)
            
        # Apply redactions to permanently remove original text objects without drawing opaque patches
        page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)
        
        # Re-insert replaced text with matching typography
        for edit in request.edits:
            if edit.action == "replace" and edit.new_text:
                x0, y0, x1, y1 = edit.pdf_rect
                rect = fitz.Rect(x0, y0, x1, y1)
                
                # Determine font name
                fontname = "helv"
                if edit.font_name:
                    fn_lower = edit.font_name.lower()
                    if ("bold" in fn_lower and "italic" in fn_lower) or "oblique" in fn_lower:
                        fontname = "hebi"
                    elif "bold" in fn_lower:
                        fontname = "hebo"
                    elif "italic" in fn_lower:
                        fontname = "heit"
                    elif "times" in fn_lower or "serif" in fn_lower:
                        fontname = "tiro"
                    elif "courier" in fn_lower or "mono" in fn_lower:
                        fontname = "cour"
                
                # Normalize color [0..255] -> [0.0..1.0]
                color_rgb = (0.0, 0.0, 0.0)
                if edit.color and len(edit.color) >= 3:
                    color_rgb = (
                        float(edit.color[0]) / 255.0,
                        float(edit.color[1]) / 255.0,
                        float(edit.color[2]) / 255.0
                    )
                
                fontsize = float(edit.font_size or 12.0)
                
                # Insert the replacement text
                page.insert_textbox(
                    rect,
                    edit.new_text,
                    fontsize=fontsize,
                    fontname=fontname,
                    color=color_rgb,
                    align=fitz.TEXT_ALIGN_LEFT
                )
                
        # Re-render page to 300 DPI high-quality pixmap
        zoom = 300 / 72
        matrix = fitz.Matrix(zoom, zoom)
        pixmap = page.get_pixmap(matrix=matrix)
        img_data = pixmap.tobytes("png")
        pil_image = Image.open(io.BytesIO(img_data))
        
        if pil_image.mode in ("RGBA", "LA", "P"):
            bg = Image.new("RGB", pil_image.size, (255, 255, 255))
            if pil_image.mode == "P":
                pil_image = pil_image.convert("RGBA")
            bg.paste(pil_image, mask=pil_image.split()[-1] if pil_image.mode == "RGBA" else None)
            pil_image = bg
            
        dominant_color = get_dominant_color(pil_image)
        
        # Resize to max 1200px
        max_width = 1200
        if pil_image.width > max_width:
            ratio = max_width / pil_image.width
            new_height = int(pil_image.height * ratio)
            pil_image = pil_image.resize((max_width, new_height), Image.Resampling.LANCZOS)
            
        img_buffer = io.BytesIO()
        pil_image.save(img_buffer, format="JPEG", quality=92, optimize=True)
        img_buffer.seek(0)
        
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        data_url = f"data:image/jpeg;base64,{img_base64}"
        
        # Export updated PDF
        pdf_out_buffer = io.BytesIO()
        pdf_doc.save(pdf_out_buffer)
        pdf_out_base64 = base64.b64encode(pdf_out_buffer.getvalue()).decode()
        
        return JSONResponse({
            "success": True,
            "message": "PDF text edited and rendered successfully",
            "image_data": data_url,
            "pdf_data": pdf_out_base64,
            "dominant_color": dominant_color,
            "image_size": {
                "width": pil_image.width,
                "height": pil_image.height
            }
        })
    except Exception as e:
        logger.error(f"Error editing PDF text: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to edit PDF text: {str(e)}")
    finally:
        if pdf_doc:
            try:
                pdf_doc.close()
            except:
                pass

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", 8001))
    uvicorn.run(app, host=host, port=port, reload=True)