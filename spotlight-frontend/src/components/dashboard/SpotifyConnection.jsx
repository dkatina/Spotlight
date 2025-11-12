import { useState, useEffect } from 'react';
import api from '../../utils/api';

const SpotifyConnection = ({ profile, onUpdate }) => {
  const [authUrl, setAuthUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const isConnected = profile?.spotify_connected || false;

  useEffect(() => {
    if (!isConnected) {
      fetchAuthUrl();
    }
  }, [isConnected]);

  const fetchAuthUrl = async () => {
    try {
      const response = await api.get('/spotify/auth-url');
      setAuthUrl(response.data.auth_url);
    } catch (error) {
      console.error('Failed to get auth URL:', error);
    }
  };

  const handleConnect = () => {
    if (authUrl) {
      window.location.href = authUrl;
    }
  };

  useEffect(() => {
    // Check if Spotify was just connected
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('spotify') === 'connected') {
      onUpdate();
      // Clean up URL
      window.history.replaceState({}, document.title, '/dashboard');
    }
  }, [onUpdate]);

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Spotify? This will remove all your music showcase items.')) {
      return;
    }

    setDisconnecting(true);
    try {
      await api.delete('/spotify/disconnect');
      alert('Spotify disconnected successfully');
      onUpdate();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to disconnect Spotify');
    } finally {
      setDisconnecting(false);
    }
  };

  if (isConnected) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-white mb-6">Spotify Connection</h2>
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 font-medium">Spotify Connected</p>
              <p className="text-green-300/80 text-sm mt-1">
                Your Spotify account is connected and ready to use.
              </p>
            </div>
            <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
              </svg>
            </div>
          </div>
        </div>
        <button
          onClick={handleDisconnect}
          disabled={disconnecting}
          className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-200 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {disconnecting ? (
            'Disconnecting...'
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
              Disconnect Spotify
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-6">Connect Spotify</h2>
      <div className="bg-white/5 border border-white/20 rounded-lg p-6">
        <p className="text-gray-300 mb-6">
          Connect your Spotify account to browse and showcase your music on your profile.
        </p>
        <button
          onClick={handleConnect}
          disabled={loading || !authUrl}
          className="w-full py-3 bg-spotify-green hover:bg-[#1ed760] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            'Connecting...'
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
              </svg>
              Connect with Spotify
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SpotifyConnection;

