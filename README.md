# VoiceDoc

VoiceDoc is a document image to speech web application. A user uploads an image of printed text, the backend extracts text from the image using OCR, and the app generates an MP3 audio file so the user can listen to the content.

The project has two frontends:

- A React + Vite frontend in `frontend/`
- The original Flask template frontend in `templates/` and `static/`

The React frontend is the main frontend to run during development.

## Features

- User registration and login
- Admin account support through environment variables
- Document image upload
- Drag and drop upload UI
- Text document mode
- Math equation mode
- OCR using Tesseract
- Image preprocessing using OpenCV
- Text to speech using gTTS
- Generated MP3 playback
- Custom audio controls
- Download MP3 output
- Download extracted text as TXT
- Light and dark mode
- User profile dropdown with account and conversion stats
- SQLite database for users and conversion history

## Tech Stack

| Area | Technology |
| --- | --- |
| Backend | Flask |
| Frontend | React, Vite |
| Legacy frontend | Jinja templates, HTML, CSS, JavaScript |
| Database | SQLite |
| OCR | Tesseract OCR, pytesseract |
| Image processing | OpenCV, Pillow, NumPy |
| Text to speech | gTTS |
| Production server | Gunicorn |
| Deployment config | Docker, Railway, Nixpacks |

## Project Structure

```text
TTS-proj-main/
  app.py
  requirements.txt
  README.md
  .env.example
  .gitignore
  Dockerfile
  railway.toml
  nixpacks.toml
  frontend/
    index.html
    package.json
    package-lock.json
    vite.config.js
    README.md
    src/
      main.jsx
      styles.css
  templates/
    index.html
    login.html
    register.html
  static/
    css/
      style.css
      auth.css
      audio-player.css
    js/
      main.js
    audio/
  uploads/
```

## File Explanation

### `app.py`

Main Flask backend file.

It handles:

- Flask app setup
- SQLite database setup
- User registration
- User login and logout
- Session handling
- Admin user creation from environment variables
- OCR image upload endpoint
- Text extraction using Tesseract
- Image preprocessing using OpenCV
- Text to speech generation using gTTS
- MP3 file serving
- User conversion statistics

Important API routes:

```text
POST /api/login
POST /api/register
GET  /api/me
POST /api/logout
POST /api/convert
GET  /api/audio/<filename>
```

Legacy Flask page routes are also still available:

```text
GET /login
GET /register
GET /
POST /convert
GET /audio/<filename>
```

### `frontend/`

This is the React frontend.

Use this folder for the main web app UI.

Important files:

- `frontend/src/main.jsx` - React app logic, auth pages, upload UI, OCR request, audio player, user profile dropdown
- `frontend/src/styles.css` - React app styling
- `frontend/vite.config.js` - Vite config and API proxy to Flask backend
- `frontend/package.json` - React dependencies and npm scripts
- `frontend/index.html` - HTML entry point for React

### `templates/`

Original Flask/Jinja frontend templates.

These files are kept because `app.py` still supports the old Flask-rendered pages:

- `templates/index.html` - old main app page
- `templates/login.html` - old login page
- `templates/register.html` - old register page

### `static/`

Static files used by the old Flask frontend.

- `static/css/style.css` - main old UI styling
- `static/css/auth.css` - old login/register styling
- `static/css/audio-player.css` - old custom audio player styling
- `static/js/main.js` - old frontend JavaScript
- `static/audio/` - generated MP3 files at runtime

### `uploads/`

Temporary uploaded images are stored here during processing.

This folder is ignored by Git because uploaded user files should not be pushed.

### `.env.example`

Example environment variable file.

Copy this file to `.env` locally and fill in real values:

```text
SECRET_KEY=replace-with-a-long-random-secret-key
ADMIN_USERNAME=replace-with-admin-username
ADMIN_EMAIL=replace-with-admin-email
ADMIN_PASSWORD=replace-with-admin-password
```

Never commit your real `.env` file.

### `.gitignore`

Prevents sensitive and generated files from being pushed.

It ignores:

- `.env`
- SQLite databases
- uploads
- generated audio
- logs
- Python cache files
- React `node_modules`
- React build output
- local IDE files

### Deployment Files

- `Dockerfile` - Docker deployment setup
- `railway.toml` - Railway deployment config
- `nixpacks.toml` - Nixpacks build config

## Requirements

Install these before running the project:

- Python 3.11 or newer
- Node.js and npm
- Tesseract OCR

## Install Tesseract OCR

VoiceDoc requires the Tesseract OCR system program. The Python package `pytesseract` is only a wrapper, so Tesseract must be installed separately.

### Windows

Download and install Tesseract from:

```text
https://github.com/UB-Mannheim/tesseract/wiki
```

After installation, add Tesseract to your system PATH.

Check installation:

```bash
tesseract --version
```

### Ubuntu / Debian

```bash
sudo apt update
sudo apt install tesseract-ocr -y
```

### macOS

```bash
brew install tesseract
```

## Backend Setup

From the project root:

```bash
pip install -r requirements.txt
```

Create your local `.env` file:

```bash
copy .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

Edit `.env` and add your real secret/admin values.

Run the Flask backend:

```bash
python app.py
```

Backend runs at:

```text
http://localhost:5000
```

## React Frontend Setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

React app runs at:

```text
http://localhost:5173
```

The React app sends API requests to Flask through the Vite proxy.

## How To Use

1. Start the Flask backend.
2. Start the React frontend.
3. Open `http://localhost:5173`.
4. Register a new account or log in with your admin account from `.env`.
5. Upload a JPG, PNG, or BMP image containing printed text.
6. Select text document mode or math equation mode.
7. Click convert.
8. Listen to the generated audio.
9. Download the MP3 or extracted text if needed.

## GitHub Push Commands

If this is a new local repository:

```bash
git init
git add .
git commit -m "Initial VoiceDoc app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

If the local commit already exists and you only need to add the GitHub remote:

```bash
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git branch -M main
git push -u origin main
```

If the remote already exists:

```bash
git remote -v
git push -u origin main
```

Replace this:

```text
https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
```

with your actual GitHub repository URL.

## Common Issues

### Tesseract not found

Error:

```text
TesseractNotFoundError
```

Fix:

```bash
tesseract --version
```

If the command fails, install Tesseract and add it to PATH.

### React app cannot connect to backend

Make sure Flask is running:

```text
http://localhost:5000
```

Then run React:

```bash
cd frontend
npm run dev
```

### Audio not playing

Make sure:

- You are logged in
- Conversion completed successfully
- Flask backend is still running
- The generated audio URL starts with `/api/audio/`

### Do not push sensitive files

Before pushing, check:

```bash
git status --short
```

Files like `.env`, `users.db`, `uploads/`, `static/audio/`, `node_modules/`, and `frontend/dist/` should not appear.
