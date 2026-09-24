# AI Display Studio

A full-stack application that transforms images and PDFs into laptop display mockups with live text editing using a Python FastAPI backend and a React (Vite + TypeScript + Tailwind CSS) frontend.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons, html2canvas / dom-to-image
- **Backend**: Python 3.9+, FastAPI, PyMuPDF (`fitz`), Pillow, EasyOCR, OpenCV-headless, Uvicorn
- **Platform**: Windows 10 / 11

---

## 💻 System Prerequisites (Windows)

Before starting, make sure the following are installed on your Windows machine:

| Requirement | Recommended Version | Download / Check |
| :--- | :--- | :--- |
| **Python** | 3.9 to 3.12 | [python.org](https://www.python.org/downloads/) *(⚠️ Check **"Add Python to PATH"** during installation)* |
| **Node.js & npm** | Node v18+ or v20+ (LTS) | [nodejs.org](https://nodejs.org/) |
| **Git for Windows**| 2.30+ | [git-scm.com](https://git-scm.com/) |

Verify in PowerShell or Command Prompt:
```powershell
python --version
node -v
npm -v
```

---

## 🚀 Complete Installation & Setup Guide (Windows)

Follow these steps to set up and run the project from scratch on any Windows machine.

### Step 1: Clone the Repository & Configure Environment

1. Open **PowerShell** or **Command Prompt** and clone the repository:
   ```powershell
   git clone <YOUR_REPOSITORY_URL>
   cd Resource_Generative_AI
   ```

2. Copy the environment variables template to create `.env`:
   - **PowerShell:**
     ```powershell
     Copy-Item .env.example .env
     ```
   - **Command Prompt (CMD):**
     ```cmd
     copy .env.example .env
     ```

*(Default settings in `.env` run Backend on port `8001` and allow Frontend on port `5174`)*.

---

### Step 2: Set Up & Start the Python Backend (Terminal 1)

1. Open **Terminal 1** (PowerShell or CMD) and navigate into the `backend` folder:
   ```powershell
   cd backend
   ```

2. Create a virtual environment:
   ```powershell
   python -m venv venv
   ```

3. Activate the virtual environment:
   - **PowerShell:**
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
     *(If you see an execution policy error in PowerShell, run: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` and then run the activate command again)*
   - **Command Prompt (CMD):**
     ```cmd
     venv\Scripts\activate.bat
     ```

4. Install backend dependencies:
   ```powershell
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   ```

5. Start the backend server:
   ```powershell
   # Method A (Recommended - runs through run.py with auto-reload):
   python run.py

   # Method B (Direct Python module command - works on any machine/path):
   python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
   ```

> 💡 **What is Uvicorn?**  
> `uvicorn` is the ASGI web server that executes FastAPI. It is already included in `requirements.txt` and runs behind `python run.py`. You do not need to install anything separately.

✅ **Backend is running at:**
- Server: `http://localhost:8001`
- Health Check: `http://localhost:8001/health`
- Interactive API Docs (Swagger): `http://localhost:8001/docs`

> **Note**: On the first time you run OCR text detection, `EasyOCR` will automatically download lightweight pre-trained model weights (~80MB).

---

### Step 3: Set Up & Start the React Frontend (Terminal 2)

1. Open a **new terminal window (Terminal 2)** and navigate into the `frontend` folder:
   ```powershell
   cd frontend
   ```

2. Install Node.js dependencies:
   ```powershell
   npm install
   ```

3. Start the Vite development server:
   ```powershell
   npm run dev
   ```

✅ **Frontend will display both Local and Network IP URLs:**
- **Local (Same machine):** `http://localhost:5174`
- **Network (Other devices on your Wi-Fi/LAN):** `http://192.168.x.x:5174`

---

## 🎯 Verification & Testing

1. Open `http://localhost:5174` in your browser.
2. Check the top-right header: you should see a green **"Connected"** status badge indicating successful communication with the backend.
3. Test uploading an image or a PDF document to generate a laptop display mockup.

---

## 📁 Project Structure

```
Resource_Generative_AI/
├── .env.example              # Environment configuration template
├── .env                      # Local environment file (git-ignored)
├── README.md                 # Complete project & setup documentation
├── backend/
│   ├── main.py               # FastAPI application endpoints
│   ├── ocr_processor.py      # EasyOCR detection & text replacement logic
│   ├── requirements.txt      # Python dependencies
│   ├── run.py                # Server entry point
│   └── venv/                 # Virtual environment (git-ignored)
└── frontend/
    ├── package.json          # Frontend dependencies & scripts
    ├── vite.config.ts        # Vite configuration
    ├── tailwind.config.js    # Tailwind styling config
    ├── index.html            # App entry point
    └── src/
        ├── App.tsx           # Main application UI
        ├── components/       # UI & canvas components
        └── utils/            # Brand mockups and PDF helpers
```

---

## ⚙️ How to Change Ports or Access Over Local Network (LAN)

All port settings and connection URLs are centralized in the `.env` file at the root of the project:

### Scenario A: Changing the Backend Port (e.g., from 8001 to 8080)
1. Open `.env` and change:
   ```env
   API_PORT=8080
   API_BASE_URL=http://localhost:8080
   VITE_API_BASE_URL=http://localhost:8080
   ```
2. Restart backend (`python run.py`) and frontend (`npm run dev`).

### Scenario B: Changing the Frontend Port (e.g., from 5174 to 3000)
1. Start frontend on the desired port:
   ```powershell
   cd frontend
   npm run dev -- --port 3000
   ```
2. In `.env`, add the new frontend URL to `CORS_ORIGINS`:
   ```env
   CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   ```

### Scenario C: Accessing from Another Device on Your Wi-Fi / Local Network
1. Find your Windows computer's local IP address by running `ipconfig` in PowerShell/CMD (example IP: `192.168.1.50`).
2. Update `.env`:
   ```env
   API_HOST=0.0.0.0
   API_PORT=8001
   API_BASE_URL=http://192.168.1.50:8001
   VITE_API_BASE_URL=http://192.168.1.50:8001
   CORS_ORIGINS=http://localhost:5174,http://127.0.0.1:5174,http://192.168.1.50:5174
   ```
3. Start frontend allowing host binding:
   ```powershell
   npm run dev -- --host
   ```
4. Now open `http://192.168.1.50:5174` from your phone or any device on the same Wi-Fi network!

---

## 🛠️ Windows Troubleshooting & Fixes

### 1. PowerShell Script Execution Disabled Error
- **Error:** `File ...\Activate.ps1 cannot be loaded because running scripts is disabled on this system.`
- **Fix:** In PowerShell, run:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  ```
  Then re-run `.\venv\Scripts\Activate.ps1`.

### 2. Port Already in Use (Port 8001 or 5174)
- **Fix for Backend (Port 8001):**
  Edit `.env` and change `API_PORT=8002` and `VITE_API_BASE_URL=http://localhost:8002`.
- **Fix for Frontend (Port 5174):**
  Vite will automatically offer another port (e.g., `5175`). Update `CORS_ORIGINS` in `.env` if you use a different port.

### 3. Frontend Shows "Backend Disconnected" (CORS / Connection Issue)
- Ensure the backend terminal is running and shows no errors.
- Test if `http://localhost:8001/health` responds with `{"status": "healthy"}` in your browser.
- Make sure `.env` contains `CORS_ORIGINS=http://localhost:5174,http://127.0.0.1:5174`.

### 4. `npm install` Errors on Frontend
- In PowerShell/CMD:
  ```powershell
  npm cache clean --force
  npm install
  ```

### 5. `Fatal error in launcher: Unable to create process` (Windows Path / Move Issue)
- **Error:** `Fatal error in launcher: Unable to create process using '"D:\...\venv\Scripts\python.exe" ...': The system cannot find the file specified.`
- **Cause:** Occurs when the project folder was moved, renamed, or copied from another laptop/directory because Python `.exe` binary wrappers retain hardcoded original paths.
- **Fix (Immediate):** Run with `python -m` instead of calling `.exe` directly:
  ```powershell
  python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
  ```
- **Fix (Permanent):** Delete `venv` folder and recreate it: `Remove-Item -Recurse -Force .\venv; python -m venv venv; .\venv\Scripts\Activate.ps1; pip install -r requirements.txt`.

---

## 📦 Production Build (Windows)

### Backend
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --workers 4
```

### Frontend
```powershell
cd frontend
npm run build
npm run preview
```
*(The production build output will be in `frontend\dist\`)*.

---

## 📜 License

MIT License - feel free to use and adapt this project for your needs!