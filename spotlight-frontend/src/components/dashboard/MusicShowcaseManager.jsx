import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';

const MusicShowcaseManager = ({ profile, onUpdate }) => {
  const [showcase, setShowcase] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [browsing, setBrowsing] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const fetchingAlbums = useRef(false);
  const searchTimeout = useRef(null);

  useEffect(() => {
    fetchShowcase();
  }, []);

  const fetchShowcase = async () => {
    try {
      const response = await api.get('/music-showcase');
      if (response.data && response.data.items) {
        setShowcase(response.data.items);
      } else {
        setShowcase([]);
      }
    } catch (error) {
      console.error('Failed to fetch showcase:', error);
      setShowcase([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlbums = async () => {
    // Prevent duplicate requests
    if (fetchingAlbums.current) {
      return;
    }
    
    fetchingAlbums.current = true;
    setBrowsing(true);
    setSearchQuery(''); // Clear search when fetching new albums
    setSearching(false);
    setSearchResults([]);
    try {
      const response = await api.get('/spotify/user-albums?limit=50');
      setAlbums(response.data.items || []);
      // Keep browsing true so albums stay visible
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch albums';
      alert(errorMessage);
      setBrowsing(false); // Only hide on error
    } finally {
      fetchingAlbums.current = false;
    }
  };

  const searchSpotifyAlbums = async (query) => {
    if (!query.trim()) {
      setSearching(false);
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await api.get('/spotify/search-albums', {
        params: { q: query, limit: 50 }
      });
      setSearchResults(response.data.items || []);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to search albums');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (searchQuery.trim()) {
      searchTimeout.current = setTimeout(() => {
        searchSpotifyAlbums(searchQuery);
      }, 500); // 500ms debounce
    } else {
      setSearching(false);
      setSearchResults([]);
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  const handleAddToShowcase = async (spotifyId) => {
    try {
      await api.post('/music-showcase', { spotify_item_id: spotifyId });
      setSelectedAlbum(null);
      // Fetch showcase first, then update parent
      await fetchShowcase();
      onUpdate();
      alert('Added to showcase!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add to showcase');
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this item from showcase?')) return;
    
    try {
      await api.delete(`/music-showcase/${id}`);
      // Fetch showcase first, then update parent
      await fetchShowcase();
      onUpdate();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to remove item');
    }
  };

  if (!profile?.spotify_connected) {
    return (
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-primary-light mb-4 sm:mb-6">Music Showcase</h2>
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4">
          <p className="text-yellow-200 text-sm sm:text-base">
            Please connect your Spotify account first to add music to your showcase.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-white">Music Showcase</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          {!browsing && (
            <button
              onClick={fetchAlbums}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gradient-primary hover:bg-gradient-primary-hover text-white rounded-xl text-sm sm:text-base transition-all shadow-glow active:scale-95"
            >
              Browse Albums
            </button>
          )}
          {browsing && (
            <button
              onClick={() => {
                setBrowsing(false);
                setSearchQuery(''); // Clear search when canceling
                setSearching(false);
                setSearchResults([]);
              }}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm sm:text-base transition-all border border-white/10"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {browsing && (
        <div className="mb-4 sm:mb-6">
          <div className="mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-primary-light">
              {profile?.spotify_connection?.artist_id ? 'Your Released Albums' : 'Your Liked Albums'}
            </h3>
          </div>
          
          {/* Search Input */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all of Spotify for albums..."
                className="w-full px-4 py-2.5 pl-10 bg-white/5 border border-primary/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearching(false);
                    setSearchResults([]);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Show search results or liked albums */}
          {(() => {
            // If searching, show search results
            if (searchQuery.trim()) {
              if (searching) {
                return (
                <div className="bg-gradient-to-br from-primary/10 to-accent/5 rounded-xl p-6 sm:p-8 border border-primary/30 text-center">
                  <p className="text-primary-light text-base sm:text-lg mb-2">Searching...</p>
                  <p className="text-accent text-xs sm:text-sm">Finding albums on Spotify...</p>
                </div>
                );
              }

              if (searchResults.length === 0) {
                return (
                <div className="bg-gradient-to-br from-accent/10 to-primary/5 rounded-xl p-6 sm:p-8 border border-accent/30 text-center">
                  <p className="text-primary-light text-base sm:text-lg mb-2">No albums found</p>
                  <p className="text-gray-300 text-xs sm:text-sm px-4">
                    No albums match "<span className="text-accent font-semibold">{searchQuery}</span>". Try a different search term.
                  </p>
                </div>
                );
              }

            return (
              <div>
                  <p className="text-primary-light text-xs sm:text-sm mb-3 sm:mb-4">
                    Search results for "<span className="text-accent">{searchQuery}</span>" ({searchResults.length} found)
                  </p>
                  <div className="p-1 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-h-96 overflow-y-auto">
                    {searchResults.map((album) => (
                      <div
                        key={album.spotify_id}
                        className="bg-gradient-to-br from-white/5 via-primary/5 to-accent/5 rounded-xl p-3 sm:p-4 border border-primary/20 hover:border-primary/60 transition-all cursor-pointer hover:shadow-glow hover:scale-[1.01] active:scale-[0.98]"
                        onClick={() => setSelectedAlbum(album)}
                      >
                        {album.image_url && (
                          <img
                            src={album.image_url}
                            alt={album.item_name}
                            className="w-full aspect-square object-cover rounded-lg mb-3"
                          />
                        )}
                        <p className="text-primary-light font-medium text-sm truncate">{album.item_name}</p>
                        <p className="text-accent/80 text-xs truncate">{album.artist_names}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            // Otherwise show liked/released albums
            if (albums.length === 0) {
              return (
                <div className="bg-gradient-to-br from-primary/10 to-accent/5 rounded-xl p-6 sm:p-8 border border-primary/30 text-center">
                  <p className="text-primary-light text-base sm:text-lg mb-2">
                    {profile?.spotify_connection?.artist_id 
                      ? 'No albums released yet' 
                      : 'No liked albums yet'}
                  </p>
                  <p className="text-gray-300 text-xs sm:text-sm px-4">
                    {profile?.spotify_connection?.artist_id
                      ? 'You haven\'t posted any albums, singles, or EPs on Spotify yet. Once you release music on Spotify, it will appear here.'
                      : 'You haven\'t saved any albums to your Spotify library yet. Like albums on Spotify to see them here.'}
                  </p>
                </div>
              );
            }

            return (
              <div className="p-1 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-h-96 overflow-y-auto">
                {albums.map((album) => (
                <div
                  key={album.spotify_id}
                  className="bg-gradient-to-br from-white/5 via-primary/5 to-accent/5 rounded-xl p-3 sm:p-4 border border-primary/20 hover:border-primary/60 transition-all cursor-pointer hover:shadow-glow hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => setSelectedAlbum(album)}
                >
                  {album.image_url && (
                    <img
                      src={album.image_url}
                      alt={album.item_name}
                      className="w-full aspect-square object-cover rounded-lg mb-3"
                    />
                  )}
                  <p className="text-primary-light font-medium text-sm truncate">{album.item_name}</p>
                  <p className="text-accent/80 text-xs truncate">{album.artist_names}</p>
                </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {selectedAlbum && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-bg-secondary via-primary/10 to-accent/10 rounded-2xl p-4 sm:p-6 max-w-md w-full border border-primary/30 shadow-glow-lg">
            <h3 className="text-lg sm:text-xl font-semibold text-primary-light mb-3 sm:mb-4">Add to Showcase?</h3>
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              {selectedAlbum.image_url && (
                <img
                  src={selectedAlbum.image_url}
                  alt={selectedAlbum.item_name}
                  className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-primary-light font-medium text-sm sm:text-base truncate">{selectedAlbum.item_name}</p>
                <p className="text-accent/80 text-xs sm:text-sm truncate">{selectedAlbum.artist_names}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => handleAddToShowcase(selectedAlbum.spotify_id)}
                className="flex-1 py-2.5 bg-gradient-primary hover:bg-gradient-primary-hover text-white rounded-xl transition-all shadow-glow active:scale-95 text-sm sm:text-base"
              >
                Add
              </button>
              <button
                onClick={() => setSelectedAlbum(null)}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10 text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        {showcase.length === 0 ? (
          <p className="text-primary-light/80 text-center py-8 text-sm sm:text-base">
            No items in showcase yet. Browse your albums above to add music!
          </p>
        ) : (
          showcase.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-gradient-to-br from-white/5 via-primary/5 to-accent/5 rounded-xl border border-primary/20 hover:border-primary/50 transition-all hover:shadow-glow"
            >
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.item_name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm sm:text-base truncate">{item.item_name}</p>
                  <p className="text-gray-400 text-xs sm:text-sm truncate">{item.artist_names}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(item.id)}
                className="w-full sm:w-auto px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-xl text-sm transition-all border border-red-500/30"
              >
                Remove
              </button>
            </div>
          ))
        )}
        {showcase.length >= 5 && (
          <p className="text-yellow-200 text-xs sm:text-sm text-center">
            Maximum 5 items in showcase. Remove an item to add more.
          </p>
        )}
      </div>
    </div>
  );
};

export default MusicShowcaseManager;
