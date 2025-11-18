import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/stats');
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load statistics');
      if (err.response?.status === 403) {
        // Not an admin, redirect after a moment
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
        <div className="text-white">Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Error</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-primary-light mb-2">Admin Dashboard</h1>
              <p className="text-gray-400">Platform statistics and analytics</p>
            </div>
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm transition-all border border-white/10"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Total Users Card */}
          <div className="bg-gradient-to-br from-white/5 via-primary/5 to-accent/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-primary/20 shadow-glow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-primary-light">Total Users</h2>
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
              {stats?.total_users || 0}
            </div>
            <p className="text-sm text-gray-400">Registered users</p>
          </div>

          {/* Total Link Clicks Card */}
          <div className="bg-gradient-to-br from-white/5 via-primary/5 to-accent/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-primary/20 shadow-glow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-primary-light">Total Link Clicks</h2>
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
            <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
              {stats?.total_link_clicks || 0}
            </div>
            <p className="text-sm text-gray-400">All-time clicks</p>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center">
          <button
            onClick={fetchStats}
            className="px-6 py-3 bg-gradient-primary text-white font-medium rounded-xl hover:shadow-glow transition-all active:scale-[0.98]"
          >
            Refresh Statistics
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin;

