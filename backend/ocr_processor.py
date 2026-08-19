import easyocr
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont
import io
import os
import math
import logging

logger = logging.getLogger(__name__)

_reader = None

def get_ocr_reader():
    """
    Initialize and cache EasyOCR reader
    """
    global _reader
    if _reader is None:
        logger.info("Initializing EasyOCR Reader...")
        # Initialize EasyOCR reader (CPU mode)
        _reader = easyocr.Reader(['en'], gpu=False)
        logger.info("EasyOCR Reader initialized successfully.")
    return _reader

def detect_text_color(img: np.ndarray, box: list) -> list:
    """
    Crop the bounding box region, segment the text foreground from background
    using Otsu's thresholding, and compute the mean color of the text pixels.
    """
    try:
        pts = np.array(box, dtype=np.int32)
        rect = cv2.boundingRect(pts)
        x, y, w, h = rect
        
        if w <= 0 or h <= 0:
            return [0, 0, 0]
            
        crop = img[y:y+h, x:x+w]
        if crop.size == 0:
            return [0, 0, 0]
            
        # Convert to grayscale for thresholding
        gray = cv2.cvtColor(crop, cv2.COLOR_RGB2GRAY)
        
        # Otsu's thresholding to segment text
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Check border pixels to identify the background group (usually background is more abundant at the border)
        border_pixels = np.concatenate([
            thresh[0, :],          # Top row
            thresh[-1, :],         # Bottom row
            thresh[:, 0],          # Left column
            thresh[:, -1]          # Right column
        ])
        
        bg_val = 255 if np.mean(border_pixels) > 127 else 0
        fg_mask = (thresh != bg_val)
        
        # If no foreground pixels segment, fallback to crop average color
        if not np.any(fg_mask):
            mean_color = cv2.mean(crop)[:3]
            return [int(c) for c in mean_color]
            
        # Calculate mean RGB of foreground (text) pixels
        fg_pixels = crop[fg_mask]
        mean_color = np.mean(fg_pixels, axis=0)
        return [int(c) for c in mean_color]
    except Exception as e:
        logger.error(f"Error detecting text color: {str(e)}")
        return [0, 0, 0]

def get_fitting_font(text: str, font_path: str, max_width: int, max_height: int, initial_size: int):
    """
    Search for a font size that fits the text within max_width and max_height.
    """
    size = initial_size
    # Adjust size downward until the text bounding box fits within the margins
    while size > 6:
        try:
            font = ImageFont.truetype(font_path, size=size)
            bbox = font.getbbox(text)
            tw = bbox[2] - bbox[0]
            th = bbox[3] - bbox[1]
            if tw <= max_width and th <= max_height:
                return font, size
        except Exception as e:
            logger.error(f"Font loading error: {str(e)}")
            break
        size -= 1
        
    try:
        return ImageFont.truetype(font_path, size=6), 6
    except:
        return ImageFont.load_default(), 6

def detect_text_regions(pil_image: Image.Image) -> list:
    """
    Detect text lines using EasyOCR and extract metadata.
    """
    try:
        # Convert PIL to RGB numpy array
        img_np = np.array(pil_image)
        if len(img_np.shape) == 3 and img_np.shape[2] == 4:
            img_np = cv2.cvtColor(img_np, cv2.COLOR_RGBA2RGB)
        elif len(img_np.shape) == 2:
            img_np = cv2.cvtColor(img_np, cv2.COLOR_GRAY2RGB)
            
        reader = get_ocr_reader()
        # Read text
        results = reader.readtext(img_np)
        
        ocr_results = []
        for idx, (bbox, text, conf) in enumerate(results):
            # Convert bbox coordinates to standard lists of integers
            box = [[int(pt[0]), int(pt[1])] for pt in bbox]
            
            p0, p1, p2, p3 = box
            
            # Width & height calculations
            w = int((math.dist(p0, p1) + math.dist(p3, p2)) / 2)
            h = int((math.dist(p0, p3) + math.dist(p1, p2)) / 2)
            area = w * h
            
            # Calculate rotation angle using top edge vector
            dx = p1[0] - p0[0]
            dy = p1[1] - p0[1]
            angle = math.degrees(math.atan2(dy, dx))
            
            # Extract color
            color = detect_text_color(img_np, box)
            
            ocr_results.append({
                "id": f"text_{idx}",
                "text": text,
                "box": box,
                "confidence": float(conf),
                "width": w,
                "height": h,
                "area": area,
                "angle": float(angle),
                "color": color,
                "font_size": h
            })
            
        return ocr_results
    except Exception as e:
        logger.error(f"Error detecting text regions: {str(e)}")
        return []

def apply_text_edits(pil_image: Image.Image, edits: list) -> Image.Image:
    """
    Perform inpainting for all removed/replaced text bounding boxes,
    and render replacement text with preserved styles.
    """
    # Convert PIL to OpenCV BGR image for cv2.inpaint
    img_np = np.array(pil_image)
    if len(img_np.shape) == 3 and img_np.shape[2] == 4:
        img_np = cv2.cvtColor(img_np, cv2.COLOR_RGBA2BGR)
    elif len(img_np.shape) == 3:
        img_np = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
    else:
        img_np = cv2.cvtColor(img_np, cv2.COLOR_GRAY2BGR)
        
    h_img, w_img = img_np.shape[:2]
    
    # Create mask for inpainting
    mask = np.zeros((h_img, w_img), dtype=np.uint8)
    
    # Fill bounding boxes on mask for edits (both remove and replace need inpainting)
    valid_edits = []
    for edit in edits:
        box = edit.get('box')
        if not box:
            continue
        valid_edits.append(edit)
        pts = np.array(box, dtype=np.int32)
        cv2.fillPoly(mask, [pts], 255)
        
    if len(valid_edits) == 0:
        return pil_image
        
    # Dilate mask slightly to prevent outline bleed
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    mask = cv2.dilate(mask, kernel, iterations=1)
    
    # Apply OpenCV Telea inpainting
    inpainted = cv2.inpaint(img_np, mask, 3, cv2.INPAINT_TELEA)
    
    # Convert back to PIL RGB image
    inpainted_rgb = cv2.cvtColor(inpainted, cv2.COLOR_BGR2RGB)
    result_pil = Image.fromarray(inpainted_rgb)
    
    # Load Arial font path if available on Windows
    font_path = "C:\\Windows\\Fonts\\arial.ttf"
    if not os.path.exists(font_path):
        font_path = "C:\\Windows\\Fonts\\Arial.ttf"
    if not os.path.exists(font_path):
        font_path = None
        
    # Now draw new text overlay for "replace" actions
    for edit in valid_edits:
        if edit.get('action') != 'replace':
            continue
            
        new_text = edit.get('new_text', '')
        if not new_text:
            continue
            
        box = edit.get('box')
        angle = edit.get('angle', 0.0)
        color = edit.get('color', [0, 0, 0])
        color_tuple = tuple(int(c) for c in color)
        
        pts = np.array(box, dtype=np.int32)
        rect = cv2.boundingRect(pts)
        bx, by, bw, bh = rect
        
        orig_w = edit.get('width', bw)
        orig_h = edit.get('height', bh)
        
        # Fit font size
        initial_font_size = max(10, int(orig_h))
        font = None
        
        if font_path:
            try:
                font, _ = get_fitting_font(new_text, font_path, orig_w, orig_h, initial_font_size)
            except Exception as e:
                logger.error(f"Failed to fit font: {str(e)}")
                font = None
                
        if font is None:
            font = ImageFont.load_default()
            
        # Draw on transparent rotated text image overlay
        pad = max(bw, bh)
        txt_img = Image.new("RGBA", (bw + pad, bh + pad), (0, 0, 0, 0))
        txt_draw = ImageDraw.Draw(txt_img)
        
        # Centering inside small overlay
        if hasattr(font, 'getbbox'):
            t_bbox = font.getbbox(new_text)
            tw = t_bbox[2] - t_bbox[0]
            th = t_bbox[3] - t_bbox[1]
        else:
            tw, th = txt_draw.textsize(new_text, font=font) if hasattr(txt_draw, 'textsize') else (bw, bh)
            
        tx = (txt_img.width - tw) / 2.0
        ty = (txt_img.height - th) / 2.0
        
        txt_draw.text((tx, ty), new_text, fill=color_tuple + (255,), font=font)
        
        # Rotate text (negative angle for clockwise rotation in PIL)
        rotated_txt = txt_img.rotate(-angle, resample=Image.Resampling.BICUBIC, expand=False)
        
        # Calculate center point
        center_x = sum(pt[0] for pt in box) / 4.0
        center_y = sum(pt[1] for pt in box) / 4.0
        
        paste_x = int(center_x - txt_img.width / 2.0)
        paste_y = int(center_y - txt_img.height / 2.0)
        
        result_pil.paste(rotated_txt, (paste_x, paste_y), rotated_txt)
        
    return result_pil
