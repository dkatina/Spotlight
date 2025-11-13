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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-primary-light">Social Links</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full sm:w-auto px-4 py-2 bg-gradient-primary hover:bg-gradient-primary-hover text-white rounded-xl text-sm sm:text-base transition-all shadow-glow active:scale-95"
        >
          {showAddForm ? 'Cancel' : '+ Add Link'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gradient-to-br from-white/5 via-primary/5 to-accent/5 rounded-xl border border-primary/20 space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-light mb-2">Platform</label>
            <input
              type="text"
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              required
              className="w-full px-4 py-2.5 bg-white/5 border border-primary/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all"
              placeholder="Instagram, TikTok, YouTube, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-light mb-2">URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
              className="w-full px-4 py-2.5 bg-white/5 border border-primary/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-light mb-2">Display Text (optional)</label>
            <input
              type="text"
              value={formData.display_text}
              onChange={(e) => setFormData({ ...formData, display_text: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-primary/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all"
              placeholder="Follow me on Instagram"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-primary hover:bg-gradient-primary-hover text-white rounded-xl transition-all shadow-glow active:scale-95"
          >
            Add Link
          </button>
        </form>
      )}

      <div className="space-y-3">
        {links.length === 0 ? (
          <p className="text-primary-light/80 text-center py-8 text-sm sm:text-base">No social links yet. Add your first link above!</p>
        ) : (
          links.map((link) => (
            <div
              key={link.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-gradient-to-br from-white/5 via-primary/5 to-accent/5 rounded-xl border border-primary/20 hover:border-primary/50 transition-all hover:shadow-glow"
            >
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm sm:text-base">{link.platform}</p>
                <p className="text-primary-light/70 text-xs sm:text-sm truncate">{link.display_text || link.url}</p>
              </div>
              <button
                onClick={() => handleDelete(link.id)}
                className="w-full sm:w-auto px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-xl text-sm transition-all border border-red-500/30"
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




