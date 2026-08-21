# AI Display Studio

A full-stack application that transforms images and PDFs into stunning laptop display mockups using Python backend for PDF processing and React frontend.

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS (Vite)
- **Backend**: Python + FastAPI + PyMuPDF + Pillow

## Features

- 🖼️ **Image Processing**: Upload and optimize JPG, PNG, GIF images
- 📄 **PDF Extraction**: High-quality first page extraction from PDF documents using PyMuPDF
- 💻 **Laptop Mockup**: Realistic laptop screen display with your content
- 🚀 **Fast Processing**: Python-powered backend for reliable PDF handling
- 📱 **Responsive Design**: Works on all device sizes
- 🔄 **Real-time Status**: Backend connectivity monitoring

## Quick Start

### 1. Start the Python Backend

```bash
cd backend

# Install Python dependencies
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt

# Start the FastAPI server
python run.py
```

The backend will be available at `http://localhost:8001`
- API Documentation: `http://localhost:8001/docs`
- Health Check: `http://localhost:8001/health`

### 2. Start the React Frontend

```bash
cd frontend

# Install Node.js dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend will be available at `http://localhost:5174`

## API Endpoints

### Backend (Python FastAPI)

- `GET /` - API status
- `GET /health` - Health check
- `POST /extract-pdf-image` - Extract first page from PDF as image
- `POST /process-image` - Process and optimize images

### Example Usage

```bash
# Health check
curl http://localhost:8001/health

# Extract PDF first page
curl -X POST -F "file=@document.pdf" http://localhost:8001/extract-pdf-image

# Process image
curl -X POST -F "file=@image.jpg" http://localhost:8001/process-image
```

## Project Structure

```
├── backend/                 # Python FastAPI backend
│   ├── main.py             # FastAPI application
│   ├── run.py              # Server startup script
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── utils/          # Utility functions
│   │   └── App.tsx         # Main application
│   ├── public/             # Static assets
│   └── package.json        # Node.js dependencies
└── README.md
```

## Dependencies

### Backend (Python)
- **FastAPI**: Modern web framework for APIs
- **PyMuPDF**: PDF processing and image extraction
- **Pillow**: Image processing and optimization
- **Uvicorn**: ASGI server for FastAPI

### Frontend (React)
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Vite**: Build tool and dev server
- **Lucide React**: Icons

## Development

### Backend Development
```bash
cd backend
pip install -r requirements.txt
python run.py  # Auto-reload enabled
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev  # Hot reload enabled
```

### Building for Production

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001
```

#### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## Features in Detail

### PDF Processing
- Uses PyMuPDF for reliable PDF parsing
- Extracts first page at 300 DPI for high quality
- Converts to optimized JPEG format
- Handles various PDF formats and sizes

### Image Processing
- Supports JPG, PNG, GIF formats
- Automatic format conversion and optimization
- Resizing for optimal display
- Quality preservation

### Laptop Mockup
- Realistic laptop design with proper proportions
- Responsive scaling for different screen sizes
- Loading states and error handling
- Smooth animations and transitions

## Troubleshooting

### Backend Issues
- Ensure Python 3.8+ is installed
- Check if all dependencies are installed: `pip install -r requirements.txt`
- Verify the server is running on port 8001

### Frontend Issues
- Ensure Node.js 16+ is installed
- Check if backend is accessible: visit `http://localhost:8001/health`
- Clear browser cache if experiencing issues

### CORS Issues
- Backend is configured to allow requests from `localhost:5174`
- If using different ports, update CORS settings in `backend/main.py`


## License

MIT License - feel free to use this project for your own applications!