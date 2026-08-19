#!/usr/bin/env python3
"""
Simple script to run the FastAPI server
"""
import uvicorn
from main import app

if __name__ == "__main__":
    print("[*] Starting PDF Image Extractor API...")
    print("[*] Server will be available at: http://localhost:8000")
    print("[*] API documentation at: http://localhost:8000/docs")
    print("[*] Auto-reload enabled for development")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )