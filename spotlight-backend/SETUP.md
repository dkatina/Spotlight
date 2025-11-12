# Quick Setup Guide

## Prerequisites
- Python 3.9 or higher
- pip (Python package manager)

## Step-by-Step Setup

### 1. Navigate to the backend directory
```bash
cd spotlight-backend
```

### 2. Create and activate virtual environment
```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Create environment file
Create a `.env` file in the `spotlight-backend` directory with:

```env
FLASK_SECRET_KEY=your-super-secret-key-here-change-this
FLASK_ENV=development
JWT_SECRET_KEY=another-super-secret-key-here-change-this
DATABASE_URL=sqlite:///spotlight_dev.db
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/auth/spotify/callback
CORS_ORIGINS=http://127.0.0.1:5173,http://localhost:5173,http://localhost:3000
```

### 5. Get Spotify API Credentials
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Copy the Client ID and Client Secret
4. Add `http://127.0.0.1:5173/auth/spotify/callback` to your app's redirect URIs

### 6. Initialize database
```bash
# Initialize Alembic (only needed once)
flask db init

# Create initial migration
flask db migrate -m "Initial migration"

# Apply migration
flask db upgrade
```

### 7. Run the server
```bash
python run.py
```

The API will be running at `http://localhost:5000`

## Testing the API

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "testpassword123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

## Troubleshooting

### Database Issues
- If you get migration errors, try: `flask db stamp head` then `flask db upgrade`
- To reset database: Delete the `.db` file and run migrations again

### Import Errors
- Make sure you're in the `spotlight-backend` directory
- Ensure virtual environment is activated
- Verify all dependencies are installed: `pip list`

### Port Already in Use
- Change the port in `run.py`: `app.run(debug=True, host='0.0.0.0', port=5001)`

