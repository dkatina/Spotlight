import { useState, useEffect } from 'react';
import api from '../../utils/api';

const SpotifyConnection = ({ profile, onUpdate }) => {
  const [authUrl, setAuthUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [saving, setSaving] = useState(false);
  const [disconnectingArtist, setDisconnectingArtist] = useState(false);
  const isConnected = profile?.spotify_connected || false;
  const hasArtistId = profile?.spotify_connection?.artist_id || false;

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

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await api.get('/spotify/search-artist', {
        params: { q: searchQuery, limit: 10 }
      });
      setSearchResults(response.data.artists || []);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to search for artists');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectArtist = (artist) => {
    setSelectedArtist(artist);
  };

  const handleSaveArtistId = async () => {
    if (!selectedArtist) return;

    setSaving(true);
    try {
      await api.put('/spotify/artist-id', {
        artist_id: selectedArtist.id
      });
      alert('Artist ID saved successfully!');
      setSelectedArtist(null);
      setSearchQuery('');
      setSearchResults([]);
      onUpdate();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save artist ID');
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnectArtist = async () => {
    if (!window.confirm('Are you sure you want to disconnect your artist profile? This will stop showing your artist albums on your profile.')) {
      return;
    }

    setDisconnectingArtist(true);
    try {
      await api.delete('/spotify/artist-id');
      alert('Artist profile disconnected successfully');
      onUpdate();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to disconnect artist profile');
    } finally {
      setDisconnectingArtist(false);
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

        {/* Artist ID Selection */}
        {!hasArtistId && (
          <div className="bg-white/5 border border-white/20 rounded-lg p-6 mb-4">
            <h3 className="text-lg font-semibold text-white mb-2">Are you an artist on Spotify?</h3>
            <p className="text-gray-300 text-sm mb-4">
              Connect your artist profile to showcase your albums and music on your profile.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for your artist name..."
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spotify-green"
                />
                <button
                  type="submit"
                  disabled={searching || !searchQuery.trim()}
                  className="px-6 py-2 bg-spotify-green hover:bg-[#1ed760] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mb-4">
                <p className="text-gray-300 text-sm mb-3">Select your artist profile:</p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {searchResults.map((artist) => (
                    <div
                      key={artist.id}
                      onClick={() => handleSelectArtist(artist)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedArtist?.id === artist.id
                          ? 'bg-spotify-green/20 border-spotify-green'
                          : 'bg-white/5 border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {artist.images && artist.images.length > 0 && (
                          <img
                            src={artist.images[artist.images.length - 1].url}
                            alt={artist.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-white font-medium">{artist.name}</p>
                          {artist.genres && artist.genres.length > 0 && (
                            <p className="text-gray-400 text-sm">{artist.genres.slice(0, 2).join(', ')}</p>
                          )}
                        </div>
                        {selectedArtist?.id === artist.id && (
                          <svg className="w-5 h-5 text-spotify-green" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save Button */}
            {selectedArtist && (
              <button
                onClick={handleSaveArtistId}
                disabled={saving}
                className="w-full py-3 bg-spotify-green hover:bg-[#1ed760] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  'Saving...'
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    Save Artist Profile
                  </>
                )}
              </button>
            )}

            {searchResults.length === 0 && !searching && searchQuery && (
              <p className="text-gray-400 text-sm text-center mt-4">No artists found. Try a different search term.</p>
            )}
          </div>
        )}

        {/* Show current artist if set */}
        {hasArtistId && (
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-blue-200 font-medium">Artist Profile Connected</p>
                <p className="text-blue-300/80 text-sm mt-1">
                  Your artist albums will be displayed on your profile.
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
            </div>
            <button
              onClick={handleDisconnectArtist}
              disabled={disconnectingArtist}
              className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-200 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {disconnectingArtist ? (
                'Disconnecting...'
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                  Disconnect Artist Profile
                </>
              )}
            </button>
          </div>
        )}

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

