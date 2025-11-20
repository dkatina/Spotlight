import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ProfileSetup from '../components/dashboard/ProfileSetup';
import SpotifyConnection from '../components/dashboard/SpotifyConnection';
import SocialLinksManager from '../components/dashboard/SocialLinksManager';
import MusicShowcaseManager from '../components/dashboard/MusicShowcaseManager';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profiles/me');
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
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

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'spotify', label: 'Spotify' },
    { id: 'links', label: 'Social Links' },
    { id: 'showcase', label: 'Music Showcase' },
  ];

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="bg-bg-primary/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary-light">Spotlight Dashboard</h1>
              <p className="text-primary-light text-xs sm:text-sm">Welcome, <span className="text-accent font-semibold">{user?.username}</span></p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              {user?.is_admin && (
                <a
                  href="/admin"
                  className="text-xs sm:text-sm text-accent hover:text-accent/80 font-medium transition-colors"
                >
                  Admin Dashboard
                </a>
              )}
              {profile?.profile?.is_public && (
                <a
                  href={`/${user?.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-primary hover:text-primary-light font-medium transition-colors"
                >
                  View Profile
                </a>
              )}
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
          {activeTab === 'profile' && (
            <ProfileSetup profile={profile} onUpdate={fetchProfile} />
          )}
          {activeTab === 'spotify' && (
            <SpotifyConnection profile={profile} onUpdate={fetchProfile} />
          )}
          {activeTab === 'links' && (
            <SocialLinksManager profile={profile} onUpdate={fetchProfile} />
          )}
          {activeTab === 'showcase' && (
            <MusicShowcaseManager profile={profile} onUpdate={fetchProfile} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;




