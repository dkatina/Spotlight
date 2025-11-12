import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const SpotifyCallback = () => {
  const navigate = useNavigate();
  const { fetchUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent multiple executions (e.g., from React Strict Mode)
    if (hasProcessed.current) {
      return;
    }

    const handleCallback = async () => {
      hasProcessed.current = true;
      
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        alert(`Spotify connection failed: ${error}`);
        navigate('/dashboard');
        return;
      }

      if (code) {
        try {
          await api.post('/spotify/callback', { code });
          await fetchUser();
          navigate('/dashboard?spotify=connected');
        } catch (error) {
          alert(error.response?.data?.error || 'Failed to connect Spotify');
          navigate('/dashboard');
        }
      } else {
        navigate('/dashboard');
      }
    };

    handleCallback();
  }, [navigate, fetchUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
      <div className="text-white">Connecting Spotify...</div>
    </div>
  );
};

export default SpotifyCallback;



