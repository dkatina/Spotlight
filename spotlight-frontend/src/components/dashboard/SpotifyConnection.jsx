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
        <h2 className="text-xl sm:text-2xl font-semibold text-primary-light mb-4 sm:mb-6">Spotify Connection</h2>
        <div className="bg-primary/20 border border-primary/50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <p className="text-primary-light font-medium text-sm sm:text-base">Spotify Connected</p>
              <p className="text-primary-light/80 text-xs sm:text-sm mt-1">
                Your Spotify account is connected and ready to use.
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Artist ID Selection */}
        {!hasArtistId && (
          <div className="bg-gradient-to-br from-white/5 via-primary/5 to-accent/5 border border-primary/20 rounded-xl p-4 sm:p-6 mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-primary-light mb-2">Are you an artist on Spotify?</h3>
            <p className="text-primary-light/80 text-xs sm:text-sm mb-4">
              Connect your artist profile to showcase your albums and music on your profile.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for your artist name..."
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-primary/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all"
                />
                <button
                  type="submit"
                  disabled={searching || !searchQuery.trim()}
                  className="px-4 sm:px-6 py-2.5 bg-gradient-primary hover:bg-gradient-primary-hover text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-glow active:scale-95"
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mb-4">
                <p className="text-primary-light text-xs sm:text-sm mb-3">Select your artist profile:</p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {searchResults.map((artist) => (
                    <div
                      key={artist.id}
                      onClick={() => handleSelectArtist(artist)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedArtist?.id === artist.id
                          ? 'bg-gradient-to-br from-primary/30 to-accent/20 border-primary shadow-glow'
                          : 'bg-gradient-to-br from-white/5 via-primary/5 to-accent/5 border-primary/20 hover:border-primary/50 hover:shadow-glow'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {artist.images && artist.images.length > 0 && (
                          <img
                            src={artist.images[artist.images.length - 1].url}
                            alt={artist.name}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-primary-light font-medium text-sm sm:text-base truncate">{artist.name}</p>
                          {artist.genres && artist.genres.length > 0 && (
                            <p className="text-accent/70 text-xs sm:text-sm truncate">{artist.genres.slice(0, 2).join(', ')}</p>
                          )}
                        </div>
                        {selectedArtist?.id === artist.id && (
                          <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
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
                className="w-full py-3 bg-gradient-primary hover:bg-gradient-primary-hover text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-glow active:scale-95"
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
              <p className="text-primary-light/60 text-xs sm:text-sm text-center mt-4">No artists found. Try a different search term.</p>
            )}
          </div>
        )}

        {/* Show current artist if set */}
        {hasArtistId && (
          <div className="bg-primary/20 border border-primary/50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3 gap-3">
              <div className="flex-1">
                <p className="text-primary-light font-medium text-sm sm:text-base">Artist Profile Connected</p>
                <p className="text-primary-light/80 text-xs sm:text-sm mt-1">
                  Your artist albums will be displayed on your profile.
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
            </div>
            <button
              onClick={handleDisconnectArtist}
              disabled={disconnectingArtist}
              className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-200 font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
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
          className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-200 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
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
      <h2 className="text-xl sm:text-2xl font-semibold text-primary-light mb-4 sm:mb-6">Connect Spotify</h2>
      <div className="bg-gradient-to-br from-white/5 via-primary/5 to-accent/5 border border-primary/20 rounded-xl p-4 sm:p-6">
        <p className="text-primary-light/80 text-sm sm:text-base mb-4 sm:mb-6">
          Connect your Spotify account to browse and showcase your music on your profile.
        </p>
        <button
          onClick={handleConnect}
          disabled={loading || !authUrl}
          className="w-full py-3 bg-gradient-primary hover:bg-gradient-primary-hover text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-glow active:scale-95"
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
