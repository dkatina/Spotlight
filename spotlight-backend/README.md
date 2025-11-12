# Spotlight Backend API

Flask backend for the Spotlight Music Link Hub platform.

## Setup

1. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   
   Create a `.env` file in the root directory with the following variables:
   ```env
   FLASK_SECRET_KEY=your-super-secret-key-here
   FLASK_ENV=development
   JWT_SECRET_KEY=another-super-secret-key-here
   DATABASE_URL=sqlite:///spotlight_dev.db
   SPOTIFY_CLIENT_ID=your-spotify-client-id
   SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
   SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/auth/spotify/callback
   CORS_ORIGINS=http://127.0.0.1:5173,http://localhost:5173,http://localhost:3000
   ```
   
   **Important:** Get your Spotify credentials from [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)

4. **Initialize database:**
   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```
   
   Note: If `flask db init` says migrations already initialized, skip to the migrate step.

5. **Run the application:**
   ```bash
   python run.py
   ```
   
   Or using Flask CLI:
   ```bash
   flask run
   ```

The API will be available at `http://localhost:5000`

## API Documentation

Interactive Swagger documentation is available at:
- **Swagger UI:** `http://localhost:5000/api/docs`
- **OpenAPI Spec:** `http://localhost:5000/apispec.json`

The Swagger UI provides an interactive interface to explore and test all API endpoints. You can:
- View all available endpoints organized by category
- See request/response schemas
- Test endpoints directly from the browser
- Authenticate using JWT tokens via the "Authorize" button

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/profile` - Get current user profile

### Spotify Integration
- `GET /api/spotify/auth-url` - Get Spotify OAuth URL
- `POST /api/spotify/callback` - Handle Spotify OAuth callback
- `GET /api/spotify/user-albums` - Get user's Spotify albums
- `GET /api/spotify/album/<id>` - Get album details

### Profiles
- `GET /api/profiles/<username>` - Get public profile
- `GET /api/profiles/me` - Get current user's profile
- `PUT /api/profiles/me` - Update profile

### Social Links
- `GET /api/social-links` - Get user's social links
- `POST /api/social-links` - Add social link
- `PUT /api/social-links/<id>` - Update social link
- `DELETE /api/social-links/<id>` - Delete social link
- `PUT /api/social-links/reorder` - Reorder social links

### Music Showcase
- `GET /api/music-showcase` - Get user's showcase
- `POST /api/music-showcase` - Add item to showcase
- `DELETE /api/music-showcase/<id>` - Remove item from showcase
- `PUT /api/music-showcase/reorder` - Reorder showcase items

## Development

The application uses the Flask application factory pattern for better organization and testability.

### Project Structure
```
spotlight-backend/
├── app/
│   ├── __init__.py          # Application factory
│   ├── models.py            # Database models
│   ├── routes/              # API route blueprints
│   ├── services/            # Business logic services
│   └── utils/               # Utility functions
├── migrations/              # Alembic database migrations
├── config.py                # Configuration classes
├── requirements.txt         # Python dependencies
└── run.py                   # Application entry point
```

## Environment Variables

See `.env.example` for required environment variables.

**Important:** Never commit `.env` file to version control. The `.gitignore` file is configured to exclude it.

## Testing with Swagger UI

1. Start the server: `python run.py`
2. Open your browser and navigate to `http://localhost:5000/api/docs`
3. To test protected endpoints:
   - First, use the `/api/auth/register` or `/api/auth/login` endpoint to get a JWT token
   - Click the "Authorize" button at the top of the Swagger UI
   - Enter: `Bearer <your_access_token>` (include the word "Bearer" and a space before your token)
   - Click "Authorize" and "Close"
   - Now you can test protected endpoints

