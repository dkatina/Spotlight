import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    const result = await register(formData.email, formData.username, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-dark px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-light mb-2">Spotlight</h1>
          <p className="text-sm sm:text-base text-accent">Music Link Hub</p>
        </div>

        <div className="bg-gradient-to-br from-white/5 via-primary/5 to-accent/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-primary/20 shadow-glow">
          <h2 className="text-xl sm:text-2xl font-semibold text-primary-light mb-4 sm:mb-6">Create Account</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary-light mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-primary/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all"
                placeholder="artist@example.com"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-primary-light mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={50}
                pattern="[a-zA-Z0-9_]+"
                className="w-full px-4 py-3 bg-white/5 border border-primary/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all"
                placeholder="artist123"
              />
              <p className="mt-1.5 text-xs text-gray-500">3-50 characters, alphanumeric and underscores only</p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary-light mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-4 py-3 bg-white/5 border border-primary/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all"
                placeholder="••••••••"
              />
              <p className="mt-1.5 text-xs text-gray-500">Minimum 8 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary-light mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-primary/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-primary hover:bg-gradient-primary-hover text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-glow active:scale-[0.98]"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary-light font-medium transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;




