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

def get_font(font_name: str = "arial", font_size: int = 14, is_bold: bool = False, is_italic: bool = False):
    """
    Load a font matching the name, size, and styling.
    """
    fn_lower = font_name.lower()
    if is_bold and is_italic:
        font_files = ["arialbi.ttf", "calibriz.ttf", "seguisbi.ttf", "arialbd.ttf", "arial.ttf"]
    elif is_bold or "bold" in fn_lower:
        font_files = ["arialbd.ttf", "calibrib.ttf", "seguisb.ttf", "arial.ttf"]
    elif is_italic or "italic" in fn_lower:
        font_files = ["ariali.ttf", "calibrii.ttf", "seguisi.ttf", "arial.ttf"]
    elif "times" in fn_lower or "serif" in fn_lower:
        font_files = ["times.ttf", "timesbd.ttf", "georgia.ttf", "arial.ttf"]
    elif "courier" in fn_lower or "mono" in fn_lower or "consolas" in fn_lower:
        font_files = ["consola.ttf", "cour.ttf", "arial.ttf"]
    else:
        font_files = ["arial.ttf", "calibri.ttf", "segoeui.ttf"]

    for ff in font_files:
        p = os.path.join(r"C:\Windows\Fonts", ff)
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size=max(8, int(font_size)))
            except:
                pass
        try:
            return ImageFont.truetype(ff, size=max(8, int(font_size)))
        except:
            pass

    return ImageFont.load_default()

def apply_text_edits(pil_image: Image.Image, edits: list, page_width_pts: float = 0, page_height_pts: float = 0) -> Image.Image:
    """
    Perform inpainting for all removed/replaced text bounding boxes,
    and render replacement & newly added text with preserved styles and positions.
    """
    img_np = np.array(pil_image)
    if len(img_np.shape) == 3 and img_np.shape[2] == 4:
        img_np = cv2.cvtColor(img_np, cv2.COLOR_RGBA2BGR)
    elif len(img_np.shape) == 3:
        img_np = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
    else:
        img_np = cv2.cvtColor(img_np, cv2.COLOR_GRAY2BGR)
        
    h_img, w_img = img_np.shape[:2]
    pw = page_width_pts if page_width_pts > 0 else w_img
    ph = page_height_pts if page_height_pts > 0 else h_img
    
    # Create mask for inpainting
    mask = np.zeros((h_img, w_img), dtype=np.uint8)
    
    # 1. Build inpainting mask for removed or replaced text blocks
    for edit in edits:
        action = edit.get('action')
        if action not in ('remove', 'replace'):
            continue

        rel_box = edit.get('rel_box')
        pdf_rect = edit.get('orig_pdf_rect') or edit.get('pdf_rect')
        orig_box = edit.get('orig_box') or edit.get('box')

        if rel_box and isinstance(rel_box, dict):
            rx = float(rel_box.get('left', 0)) / 100.0 * w_img
            ry = float(rel_box.get('top', 0)) / 100.0 * h_img
            rw = float(rel_box.get('width', 0)) / 100.0 * w_img
            rh = float(rel_box.get('height', 0)) / 100.0 * h_img
            x0 = max(0, int(rx - 2))
            y0 = max(0, int(ry - 2))
            x1 = min(w_img, int(rx + rw + 2))
            y1 = min(h_img, int(ry + rh + 2))
            cv2.rectangle(mask, (x0, y0), (x1, y1), 255, -1)
        elif pdf_rect and len(pdf_rect) >= 4:
            x0 = max(0, int((pdf_rect[0] / pw) * w_img - 2))
            y0 = max(0, int((pdf_rect[1] / ph) * h_img - 2))
            x1 = min(w_img, int((pdf_rect[2] / pw) * w_img + 2))
            y1 = min(h_img, int((pdf_rect[3] / ph) * h_img + 2))
            cv2.rectangle(mask, (x0, y0), (x1, y1), 255, -1)
        elif orig_box and len(orig_box) >= 4:
            pts = np.array(orig_box, dtype=np.int32)
            cv2.fillPoly(mask, [pts], 255)
            
    if np.any(mask > 0):
        # Dilate mask slightly to prevent outline bleed
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        mask = cv2.dilate(mask, kernel, iterations=1)
        
        # Apply OpenCV Telea inpainting
        inpainted = cv2.inpaint(img_np, mask, 3, cv2.INPAINT_TELEA)
        inpainted_rgb = cv2.cvtColor(inpainted, cv2.COLOR_BGR2RGB)
        result_pil = Image.fromarray(inpainted_rgb)
    else:
        result_pil = pil_image.convert("RGB")
        
    draw = ImageDraw.Draw(result_pil)
    
    # 2. Draw replacement and new text at exact coordinates
    for edit in edits:
        action = edit.get('action', 'replace')
        if action == 'remove':
            continue
            
        new_text = edit.get('new_text', '')
        if not new_text:
            continue
            
        # Determine color
        color = edit.get('color', [0, 0, 0])
        if isinstance(color, str):
            if color.startswith('#'):
                color_hex = color.lstrip('#')
                if len(color_hex) == 6:
                    color = [int(color_hex[i:i+2], 16) for i in (0, 2, 4)]
                elif len(color_hex) == 3:
                    color = [int(c * 2, 16) for c in color_hex]
                else:
                    color = [0, 0, 0]
            else:
                color = [0, 0, 0]
        color_tuple = tuple(int(c) for c in color[:3])
        
        # Determine position
        rel_box = edit.get('rel_box')
        pdf_rect = edit.get('pdf_rect')
        box = edit.get('box')
        angle = float(edit.get('angle', 0.0))
        
        if rel_box and isinstance(rel_box, dict):
            rel_left = float(rel_box.get('left', 0.0))
            rel_top = float(rel_box.get('top', 0.0))
            rel_w = float(rel_box.get('width', 20.0))
            rel_h = float(rel_box.get('height', 5.0))
            
            px_left = (rel_left / 100.0) * w_img
            px_top = (rel_top / 100.0) * h_img
            px_w = max(10, (rel_w / 100.0) * w_img)
            px_h = max(10, (rel_h / 100.0) * h_img)
            target_h = int(px_h)
            target_w = int(px_w)
        elif pdf_rect and len(pdf_rect) >= 4:
            px_left = (pdf_rect[0] / pw) * w_img
            px_top = (pdf_rect[1] / ph) * h_img
            px_w = ((pdf_rect[2] - pdf_rect[0]) / pw) * w_img
            px_h = ((pdf_rect[3] - pdf_rect[1]) / ph) * h_img
            target_h = int(px_h)
            target_w = int(px_w)
        elif box and len(box) >= 4:
            pts = np.array(box, dtype=np.int32)
            rect = cv2.boundingRect(pts)
            bx, by, bw, bh = rect
            px_left = bx
            px_top = by
            target_w = edit.get('width', bw)
            target_h = edit.get('height', bh)
        else:
            px_left = w_img * 0.1
            px_top = h_img * 0.1
            target_w = int(w_img * 0.3)
            target_h = int(h_img * 0.06)

        # Font styling
        is_bold = bool(edit.get('is_bold', False) or edit.get('font_weight') == 'bold' or ('bold' in str(edit.get('font_name', '')).lower()) or (int(edit.get('flags', 0)) & 20))
        is_italic = bool(edit.get('is_italic', False) or edit.get('font_style') == 'italic' or ('italic' in str(edit.get('font_name', '')).lower()) or (int(edit.get('flags', 0)) & 2))
        font_name = str(edit.get('font_name', 'arial'))
        
        # Fit font size
        explicit_font_size = edit.get('font_size')
        if explicit_font_size:
            scaled_font_size = max(12, int(float(explicit_font_size) * (h_img / ph)))
            scaled_font_size = min(int(target_h * 1.15), scaled_font_size)
        else:
            scaled_font_size = max(12, int(target_h * 0.85))
            
        font = get_font(font_name=font_name, font_size=scaled_font_size, is_bold=is_bold, is_italic=is_italic)
        
        # Measure text
        if hasattr(font, 'getbbox'):
            t_bbox = font.getbbox(new_text)
            th = t_bbox[3] - t_bbox[1]
        else:
            th = int(target_h * 0.85)
            
        draw_x = int(px_left)
        draw_y = int(px_top + max(0, (target_h - th) / 2))
        
        if abs(angle) > 0.01:
            pad_w = int(target_w) + 80
            pad_h = int(target_h) + 80
            txt_img = Image.new("RGBA", (pad_w, pad_h), (0, 0, 0, 0))
            txt_draw = ImageDraw.Draw(txt_img)
            txt_draw.text((10, 10), new_text, fill=color_tuple + (255,), font=font)
            rotated_txt = txt_img.rotate(-angle, resample=Image.Resampling.BICUBIC, expand=True)
            result_pil.paste(rotated_txt, (draw_x, draw_y), rotated_txt)
        else:
            draw.text((draw_x, draw_y), new_text, fill=color_tuple, font=font)
        
    return result_pil
