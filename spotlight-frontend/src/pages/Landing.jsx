import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Navigation */}
      <nav className="bg-black/30 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-spotify-green rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Spotlight</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-spotify-green hover:bg-[#1ed760] text-white font-semibold rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Your Music.
              <br />
              <span className="text-spotify-green">Your Links.</span>
              <br />
              One Hub.
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The link hub platform built specifically for musicians. Showcase your Spotify music, 
              connect all your social links, and grow your audience—all in one beautiful profile.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-4 bg-spotify-green hover:bg-[#1ed760] text-white font-semibold rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg shadow-spotify-green/50"
              >
                Start Free
              </Link>
              <a
                href="#features"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg text-lg transition-all border border-white/20"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-spotify-green/20 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -z-10"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Everything You Need to Shine
            </h3>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Built for musicians, by musicians. Spotlight combines the best of link hubs with powerful music integration.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-spotify-green/50 transition-all hover:transform hover:scale-105">
              <div className="w-14 h-14 bg-spotify-green/20 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-spotify-green" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
              <h4 className="text-2xl font-semibold text-white mb-3">Spotify Integration</h4>
              <p className="text-gray-300">
                Connect your Spotify account and showcase your albums, singles, and EPs directly on your profile. 
                Your music, front and center.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-spotify-green/50 transition-all hover:transform hover:scale-105">
              <div className="w-14 h-14 bg-spotify-green/20 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-spotify-green" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h4 className="text-2xl font-semibold text-white mb-3">All Your Links</h4>
              <p className="text-gray-300">
                Connect Instagram, TikTok, YouTube, Twitter, and more. One link to rule them all—your 
                custom spotlight.com/username URL.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-spotify-green/50 transition-all hover:transform hover:scale-105">
              <div className="w-14 h-14 bg-spotify-green/20 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-spotify-green" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h4 className="text-2xl font-semibold text-white mb-3">Customizable</h4>
              <p className="text-gray-300">
                Make it yours. Customize your profile with your bio, avatar, and theme. Your brand, 
                your way.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-spotify-green/50 transition-all hover:transform hover:scale-105">
              <div className="w-14 h-14 bg-spotify-green/20 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-spotify-green" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
                </svg>
              </div>
              <h4 className="text-2xl font-semibold text-white mb-3">Free Forever</h4>
              <p className="text-gray-300">
                No credit card required. No hidden fees. Start building your music hub today, 
                completely free.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-spotify-green/50 transition-all hover:transform hover:scale-105">
              <div className="w-14 h-14 bg-spotify-green/20 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-spotify-green" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h4 className="text-2xl font-semibold text-white mb-3">Mobile Ready</h4>
              <p className="text-gray-300">
                Your profile looks perfect on any device. Share your link anywhere—Instagram bio, 
                TikTok, email signatures.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-spotify-green/50 transition-all hover:transform hover:scale-105">
              <div className="w-14 h-14 bg-spotify-green/20 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-spotify-green" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                </svg>
              </div>
              <h4 className="text-2xl font-semibold text-white mb-3">Easy Setup</h4>
              <p className="text-gray-300">
                Get started in minutes. Connect Spotify, add your links, customize your profile, 
                and you're live.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h3>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Three simple steps to your perfect music hub
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-spotify-green rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white">
                1
              </div>
              <h4 className="text-2xl font-semibold text-white mb-4">Sign Up</h4>
              <p className="text-gray-300">
                Create your free account in seconds. Choose your unique username and you're ready to go.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-spotify-green rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white">
                2
              </div>
              <h4 className="text-2xl font-semibold text-white mb-4">Connect & Customize</h4>
              <p className="text-gray-300">
                Link your Spotify account, add your social media links, and personalize your profile.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-spotify-green rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white">
                3
              </div>
              <h4 className="text-2xl font-semibold text-white mb-4">Share & Grow</h4>
              <p className="text-gray-300">
                Share your spotlight.com/username link everywhere and watch your audience grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-spotify-green/20 to-blue-500/20 rounded-3xl p-12 border border-white/20">
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Shine?
            </h3>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join musicians who are already using Spotlight to grow their audience and showcase their music.
            </p>
            <Link
              to="/register"
              className="inline-block px-8 py-4 bg-spotify-green hover:bg-[#1ed760] text-white font-semibold rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg shadow-spotify-green/50"
            >
              Get Started Free
            </Link>
            <p className="text-gray-400 text-sm mt-4">No credit card required • Setup in minutes</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-spotify-green rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                </svg>
              </div>
              <span className="text-white font-semibold">Spotlight</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 Spotlight. Built for musicians, by musicians.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

