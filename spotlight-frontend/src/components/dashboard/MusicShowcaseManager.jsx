import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';

const MusicShowcaseManager = ({ profile, onUpdate }) => {
  const [showcase, setShowcase] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [browsing, setBrowsing] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const fetchingAlbums = useRef(false);

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
        <h2 className="text-2xl font-semibold text-white mb-6">Music Showcase</h2>
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
          <p className="text-yellow-200">
            Please connect your Spotify account first to add music to your showcase.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">Music Showcase</h2>
        <div className="flex gap-2">
          {!browsing && (
            <button
              onClick={fetchAlbums}
              className="px-4 py-2 bg-spotify-green hover:bg-[#1ed760] text-white rounded-lg transition-colors"
            >
              Browse Albums
            </button>
          )}
          {browsing && (
            <button
              onClick={() => setBrowsing(false)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {browsing && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Your Released Albums</h3>
          {albums.length === 0 ? (
            <div className="bg-white/5 rounded-lg p-8 border border-white/20 text-center">
              <p className="text-gray-300 text-lg mb-2">No albums released yet</p>
              <p className="text-gray-400 text-sm">
                You haven't posted any albums, singles, or EPs on Spotify yet. Once you release music on Spotify, it will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {albums.map((album) => (
                <div
                  key={album.spotify_id}
                  className="bg-white/5 rounded-lg p-4 border border-white/20 hover:border-spotify-green transition-colors cursor-pointer"
                  onClick={() => setSelectedAlbum(album)}
                >
                  {album.image_url && (
                    <img
                      src={album.image_url}
                      alt={album.item_name}
                      className="w-full aspect-square object-cover rounded-lg mb-3"
                    />
                  )}
                  <p className="text-white font-medium text-sm truncate">{album.item_name}</p>
                  <p className="text-gray-400 text-xs truncate">{album.artist_names}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedAlbum && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-secondary rounded-lg p-6 max-w-md w-full border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Add to Showcase?</h3>
            <div className="flex items-center gap-4 mb-6">
              {selectedAlbum.image_url && (
                <img
                  src={selectedAlbum.image_url}
                  alt={selectedAlbum.item_name}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              )}
              <div>
                <p className="text-white font-medium">{selectedAlbum.item_name}</p>
                <p className="text-gray-400 text-sm">{selectedAlbum.artist_names}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleAddToShowcase(selectedAlbum.spotify_id)}
                className="flex-1 py-2 bg-spotify-green hover:bg-[#1ed760] text-white rounded-lg transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setSelectedAlbum(null)}
                className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {showcase.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No items in showcase yet. Browse your albums above to add music!
          </p>
        ) : (
          showcase.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/20"
            >
              <div className="flex items-center gap-4">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.item_name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div>
                  <p className="text-white font-medium">{item.item_name}</p>
                  <p className="text-gray-400 text-sm">{item.artist_names}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(item.id)}
                className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded transition-colors"
              >
                Remove
              </button>
            </div>
          ))
        )}
        {showcase.length >= 5 && (
          <p className="text-yellow-200 text-sm text-center">
            Maximum 5 items in showcase. Remove an item to add more.
          </p>
        )}
      </div>
    </div>
  );
};

export default MusicShowcaseManager;
