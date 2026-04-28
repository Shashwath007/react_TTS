# VoiceDoc React Frontend

This is the React frontend for the Flask VoiceDoc backend.

## Run Backend

From the project root:

```bash
pip install -r requirements.txt
python app.py
```

The backend runs at:

```text
http://localhost:5000
```

## Run React Frontend

From this `frontend` folder:

```bash
npm install
npm run dev
```

The React app runs at:

```text
http://localhost:5173
```

## Backend API Used By React

- `POST /api/login`
- `POST /api/register`
- `GET /api/me`
- `POST /api/logout`
- `POST /api/convert`
- `GET /api/audio/<filename>`
