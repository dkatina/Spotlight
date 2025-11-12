import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

const PublicProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/profiles/${username}`);
      setProfile(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Profile not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Profile Not Found</h1>
          <p className="text-gray-400">{error || 'This profile does not exist or is not public.'}</p>
        </div>
      </div>
    );
  }

  const { profile: profileData, social_links, music_showcase } = profile;

  // Get avatar URL - handle both uploaded files and external URLs
  const getAvatarUrl = () => {
    if (!profileData.avatar_url) return null;
    // If it's a relative path (uploaded file), construct full URL
    if (profileData.avatar_url.startsWith('/api/uploads/')) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';
      return baseUrl.replace('/api', '') + profileData.avatar_url;
    }
    // Otherwise it's an external URL
    return profileData.avatar_url;
  };
  const avatarUrl = getAvatarUrl();

  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt={profileData.display_name || username}
              className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white/20 object-cover"
            />
          )}
          <h1 className="text-4xl font-bold text-white mb-2">
            {profileData.display_name || username}
          </h1>
          {profileData.bio && (
            <p className="text-gray-300 text-lg">{profileData.bio}</p>
          )}
        </div>

        {/* Social Links */}
        {social_links && social_links.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Connect</h2>
            <div className="space-y-3">
              {social_links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-4 px-6 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-colors text-center"
                >
                  {link.display_text || link.platform}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Music Showcase */}
        {music_showcase && music_showcase.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Music</h2>
            <div className="space-y-4">
              {music_showcase.map((item) => (
                <div key={item.id} className="bg-white/5 rounded-xl p-4 border border-white/20">
                  <iframe
                    src={`https://open.spotify.com/embed/album/${item.spotify_item_id}?utm_source=generator&theme=0`}
                    width="100%"
                    height="352"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Powered by <span className="text-spotify-green">Spotlight</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;



