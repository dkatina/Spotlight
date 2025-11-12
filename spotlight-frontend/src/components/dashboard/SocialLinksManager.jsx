import { useState, useEffect } from 'react';
import api from '../../utils/api';

const SocialLinksManager = ({ profile, onUpdate }) => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    platform: '',
    url: '',
    display_text: '',
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await api.get('/social-links');
      setLinks(response.data.links);
    } catch (error) {
      console.error('Failed to fetch links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/social-links', formData);
      setFormData({ platform: '', url: '', display_text: '' });
      setShowAddForm(false);
      fetchLinks();
      onUpdate();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add link');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this link?')) return;
    
    try {
      await api.delete(`/social-links/${id}`);
      fetchLinks();
      onUpdate();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete link');
    }
  };

  const handleReorder = async (linkIds) => {
    try {
      await api.put('/social-links/reorder', { link_ids: linkIds });
      fetchLinks();
      onUpdate();
    } catch (error) {
      console.error('Failed to reorder links:', error);
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">Social Links</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-spotify-green hover:bg-[#1ed760] text-white rounded-lg transition-colors"
        >
          {showAddForm ? 'Cancel' : '+ Add Link'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="mb-6 p-4 bg-white/5 rounded-lg border border-white/20 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Platform</label>
            <input
              type="text"
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              required
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
              placeholder="Instagram, TikTok, YouTube, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Display Text (optional)</label>
            <input
              type="text"
              value={formData.display_text}
              onChange={(e) => setFormData({ ...formData, display_text: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
              placeholder="Follow me on Instagram"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-spotify-green hover:bg-[#1ed760] text-white rounded-lg transition-colors"
          >
            Add Link
          </button>
        </form>
      )}

      <div className="space-y-3">
        {links.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No social links yet. Add your first link above!</p>
        ) : (
          links.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/20"
            >
              <div>
                <p className="text-white font-medium">{link.platform}</p>
                <p className="text-gray-400 text-sm">{link.display_text || link.url}</p>
              </div>
              <button
                onClick={() => handleDelete(link.id)}
                className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded transition-colors"
              >
                Delete
              </button>
            </div>
          )))
        }
      </div>
    </div>
  );
};

export default SocialLinksManager;




