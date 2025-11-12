import { useState, useRef } from 'react';
import api from '../../utils/api';

const ProfileSetup = ({ profile, onUpdate }) => {
  const [formData, setFormData] = useState({
    display_name: profile?.profile?.display_name || '',
    bio: profile?.profile?.bio || '',
    is_public: profile?.profile?.is_public ?? true,
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  // Get current avatar URL for display
  const currentAvatarUrl = profile?.profile?.avatar_url || null;
  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;
    if (!currentAvatarUrl) return null;
    // If it's a relative path (uploaded file), construct full URL
    if (currentAvatarUrl.startsWith('/api/uploads/')) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';
      return baseUrl.replace('/api', '') + currentAvatarUrl;
    }
    // Otherwise it's an external URL
    return currentAvatarUrl;
  };
  const displayAvatarUrl = getAvatarUrl();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setMessage('Invalid file type. Please upload a PNG, JPG, GIF, or WebP image.');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('File size too large. Please upload an image smaller than 5MB.');
        return;
      }

      setAvatarFile(file);
      setRemoveAvatar(false); // Cancel removal if user selects a new file
      setMessage('');

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const submitData = new FormData();
      submitData.append('display_name', formData.display_name);
      submitData.append('bio', formData.bio);
      submitData.append('is_public', formData.is_public);
      
      if (avatarFile) {
        submitData.append('avatar', avatarFile);
      }
      
      if (removeAvatar) {
        submitData.append('remove_avatar', 'true');
      }

      await api.put('/profiles/me', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setMessage('Profile updated successfully!');
      setAvatarFile(null);
      setAvatarPreview(null);
      setRemoveAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
          <label htmlFor="avatar" className="block text-sm font-medium text-gray-300 mb-2">
            Avatar
          </label>
          
          {/* Avatar Preview */}
          {(displayAvatarUrl || avatarPreview) && (
            <div className="mb-4 flex items-center gap-4">
              <img
                src={displayAvatarUrl}
                alt="Avatar preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-white/20"
              />
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-200 text-sm transition-colors"
              >
                Remove Avatar
              </button>
            </div>
          )}

          {/* File Input */}
          <input
            id="avatar"
            name="avatar"
            type="file"
            ref={fileInputRef}
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
            onChange={handleAvatarChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-spotify-green file:text-white hover:file:bg-[#1ed760] file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent"
          />
          <p className="mt-2 text-xs text-gray-400">
            Supported formats: PNG, JPG, GIF, WebP (max 5MB)
          </p>
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



