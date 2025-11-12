# Spotlight Frontend

React frontend for the Spotlight Music Link Hub platform.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://127.0.0.1:5000/api
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

The application will be available at `http://127.0.0.1:5173`

## Features

- **Authentication:** User registration and login
- **Dashboard:** Profile management, Spotify connection, social links, and music showcase
- **Public Profiles:** Custom URLs (`/username`) for sharing
- **Spotify Integration:** Browse and showcase albums, singles, and EPs
- **Dark Theme:** Modern gradient design optimized for mobile

## Project Structure

```
spotlight-frontend/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable components
│   │   └── dashboard/        # Dashboard-specific components
│   ├── context/              # React Context providers
│   ├── pages/                 # Page components
│   ├── utils/                  # Utilities (API client, etc.)
│   ├── App.jsx                # Main app component
│   └── main.jsx               # Entry point
├── public/                    # Static assets
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **TailwindCSS** - Utility-first CSS
- **Axios** - HTTP client

