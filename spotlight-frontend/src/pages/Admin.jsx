import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Admin = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (activeTab === 'stats') {
      fetchStats();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, page]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/users?page=${page}&per_page=20`);
      setUsers(response.data.users);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/toggle-admin`);
      fetchUsers(); // Refresh users list
      if (userId === user?.id) {
        // If toggling own admin status, logout
        logout();
      }
    } catch (error) {
      console.error('Failed to toggle admin status:', error);
      alert(error.response?.data?.error || 'Failed to update admin status');
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'stats', label: 'Statistics' },
    { id: 'users', label: 'Users' },
  ];

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="bg-bg-primary/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary-light">Admin Dashboard</h1>
              <p className="text-primary-light text-xs sm:text-sm">Welcome, <span className="text-accent font-semibold">{user?.username}</span></p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <a
                href="/dashboard"
                className="text-xs sm:text-sm text-primary hover:text-primary-light font-medium transition-colors"
              >
                User Dashboard
              </a>
              <button
                onClick={logout}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm transition-all border border-white/10"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-wrap sm:flex-nowrap gap-1 sm:gap-1 bg-white/5 rounded-xl p-1 mb-4 sm:mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-none py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-primary text-white shadow-glow'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-gradient-to-br from-white/5 via-primary/5 to-accent/5 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-primary/20 shadow-glow">
          {activeTab === 'stats' && stats && (
            <div>
              <h2 className="text-xl font-bold text-primary-light mb-6">Platform Statistics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-gray-400 text-sm mb-1">Total Users</div>
                  <div className="text-2xl font-bold text-primary-light">{stats.total_users}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-gray-400 text-sm mb-1">User Link Clicks</div>
                  <div className="text-2xl font-bold text-primary-light">{stats.total_profile_clicks}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-gray-400 text-sm mb-1">Social Links</div>
                  <div className="text-2xl font-bold text-primary-light">{stats.total_social_links}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-gray-400 text-sm mb-1">Showcase Items</div>
                  <div className="text-2xl font-bold text-primary-light">{stats.total_showcase_items}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-gray-400 text-sm mb-1">Spotify Connections</div>
                  <div className="text-2xl font-bold text-primary-light">{stats.total_spotify_connections}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2 className="text-xl font-bold text-primary-light mb-6">User Management</h2>
              {loading ? (
                <div className="text-center text-gray-400 py-8">Loading users...</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="pb-3 text-gray-400 text-sm font-medium">ID</th>
                          <th className="pb-3 text-gray-400 text-sm font-medium">Email</th>
                          <th className="pb-3 text-gray-400 text-sm font-medium">Username</th>
                          <th className="pb-3 text-gray-400 text-sm font-medium">Admin</th>
                          <th className="pb-3 text-gray-400 text-sm font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id} className="border-b border-white/5">
                            <td className="py-3 text-primary-light">{u.id}</td>
                            <td className="py-3 text-primary-light">{u.email}</td>
                            <td className="py-3 text-primary-light">{u.username}</td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded text-xs ${
                                u.is_admin 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}>
                                {u.is_admin ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="py-3">
                              {u.id !== user?.id && (
                                <button
                                  onClick={() => toggleAdmin(u.id)}
                                  className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded text-sm transition-all border border-white/10"
                                >
                                  {u.is_admin ? 'Revoke Admin' : 'Grant Admin'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 text-primary-light">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;

