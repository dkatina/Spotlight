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
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Spotlight Dashboard</h1>
              <p className="text-gray-400 text-sm">Welcome, {user?.username}</p>
            </div>
            <div className="flex items-center gap-4">
              {profile?.profile?.is_public && (
                <a
                  href={`/${user?.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-spotify-green hover:text-[#1ed760]"
                >
                  View Profile
                </a>
              )}
              <button
                onClick={logout}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-1 bg-white/5 rounded-lg p-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-spotify-green text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
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



