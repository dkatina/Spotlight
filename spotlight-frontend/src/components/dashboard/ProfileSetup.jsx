import { useState } from 'react';
import api from '../../utils/api';

const ProfileSetup = ({ profile, onUpdate }) => {
  const [formData, setFormData] = useState({
    display_name: profile?.profile?.display_name || '',
    bio: profile?.profile?.bio || '',
    avatar_url: profile?.profile?.avatar_url || '',
    is_public: profile?.profile?.is_public ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.put('/profiles/me', formData);
      setMessage('Profile updated successfully!');
      onUpdate();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-6">Profile Settings</h2>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.includes('success')
              ? 'bg-green-500/20 border border-green-500/50 text-green-200'
              : 'bg-red-500/20 border border-red-500/50 text-red-200'
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="display_name" className="block text-sm font-medium text-gray-300 mb-2">
            Display Name
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            value={formData.display_name}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent"
            placeholder="Your Artist Name"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div>
          <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-300 mb-2">
            Avatar URL
          </label>
          <input
            id="avatar_url"
            name="avatar_url"
            type="url"
            value={formData.avatar_url}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent"
            placeholder="https://example.com/avatar.jpg"
          />
        </div>

        <div className="flex items-center">
          <input
            id="is_public"
            name="is_public"
            type="checkbox"
            checked={formData.is_public}
            onChange={handleChange}
            className="w-4 h-4 text-spotify-green bg-white/5 border-white/20 rounded focus:ring-spotify-green"
          />
          <label htmlFor="is_public" className="ml-2 text-sm text-gray-300">
            Make profile public
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-spotify-green hover:bg-[#1ed760] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default ProfileSetup;



