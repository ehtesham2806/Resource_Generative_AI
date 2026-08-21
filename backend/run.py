#!/usr/bin/env python3
"""
Simple script to run the FastAPI server
"""
import os
import uvicorn
from main import app

if __name__ == "__main__":
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", 8001))
    
    print("[*] Starting PDF Image Extractor API...")
    print(f"[*] Server will be available at: http://localhost:{port}")
    print(f"[*] API documentation at: http://localhost:{port}/docs")
    print("[*] Auto-reload enabled for development")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )