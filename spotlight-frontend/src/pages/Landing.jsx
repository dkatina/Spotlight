import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Navigation */}
      <nav className="bg-bg-primary/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                </svg>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Spotlight</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                to="/login"
                className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors px-2 sm:px-0"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-primary hover:bg-gradient-primary-hover text-white font-semibold rounded-lg text-sm sm:text-base transition-all shadow-glow"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-24 md:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight text-balance">
              <span className="text-primary-light">Your Music.</span>
              <br />
              <span className="text-white">Your Links.</span>
              <br />
              <span className="text-accent">One Hub.</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4 text-balance">
              The link hub platform built specifically for musicians. Showcase your Spotify music, 
              connect all your social links, and grow your audience—all in one beautiful profile.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link
                to="/register"
                className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-primary hover:bg-gradient-primary-hover text-white font-semibold rounded-xl text-base sm:text-lg transition-all transform hover:scale-105 shadow-glow-lg active:scale-95"
              >
                Start Free
              </Link>
              <a
                href="#features"
                className="px-6 py-3 sm:px-8 sm:py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl text-base sm:text-lg transition-all border border-white/20 backdrop-blur-sm"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-10 sm:top-20 left-0 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-primary/20 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-10 sm:bottom-20 right-0 sm:right-10 w-64 h-64 sm:w-96 sm:h-96 bg-accent/20 rounded-full blur-3xl -z-10"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 text-balance">
              Everything You Need to Shine
            </h3>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto px-4 text-balance">
              Built for musicians, by musicians. Spotlight combines the best of link hubs with powerful music integration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/5 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-primary/30 hover:border-primary/60 transition-all hover:transform hover:scale-[1.02] hover:shadow-glow">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-glow">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
              <h4 className="text-xl sm:text-2xl font-semibold text-white mb-2 sm:mb-3">Spotify Integration</h4>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                Connect your Spotify account and showcase your albums, singles, and EPs directly on your profile. 
                Your music, front and center.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-accent/10 to-primary/5 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-accent/30 hover:border-accent/60 transition-all hover:transform hover:scale-[1.02] hover:shadow-glow">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-accent to-accent-dark rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-glow">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h4 className="text-xl sm:text-2xl font-semibold text-white mb-2 sm:mb-3">All Your Links</h4>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                Connect Instagram, TikTok, YouTube, Twitter, and more. One link to rule them all—your 
                custom spotlight.com/username URL.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-blue-500/30 hover:border-blue-500/60 transition-all hover:transform hover:scale-[1.02] hover:shadow-glow">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-glow">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h4 className="text-xl sm:text-2xl font-semibold text-white mb-2 sm:mb-3">Customizable</h4>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                Make it yours. Customize your profile with your bio, avatar, and theme. Your brand, 
                your way.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-green-500/30 hover:border-green-500/60 transition-all hover:transform hover:scale-[1.02] hover:shadow-glow">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-glow">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
                </svg>
              </div>
              <h4 className="text-xl sm:text-2xl font-semibold text-white mb-2 sm:mb-3">Free Forever</h4>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                No credit card required. No hidden fees. Start building your music hub today, 
                completely free.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/5 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-yellow-500/30 hover:border-yellow-500/60 transition-all hover:transform hover:scale-[1.02] hover:shadow-glow">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-glow">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h4 className="text-xl sm:text-2xl font-semibold text-white mb-2 sm:mb-3">Mobile Ready</h4>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                Your profile looks perfect on any device. Share your link anywhere—Instagram bio, 
                TikTok, email signatures.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-purple-500/30 hover:border-purple-500/60 transition-all hover:transform hover:scale-[1.02] hover:shadow-glow">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-glow">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                </svg>
              </div>
              <h4 className="text-xl sm:text-2xl font-semibold text-white mb-2 sm:mb-3">Easy Setup</h4>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                Get started in minutes. Connect Spotify, add your links, customize your profile, 
                and you're live.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 text-balance">
              How It Works
            </h3>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto px-4 text-balance">
              Three simple steps to your perfect music hub
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-2xl sm:text-3xl font-bold text-white shadow-glow">
                1
              </div>
              <h4 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4">Sign Up</h4>
              <p className="text-sm sm:text-base text-gray-300 px-4">
                Create your free account in seconds. Choose your unique username and you're ready to go.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-2xl sm:text-3xl font-bold text-white shadow-glow">
                2
              </div>
              <h4 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4">Connect & Customize</h4>
              <p className="text-sm sm:text-base text-gray-300 px-4">
                Link your Spotify account, add your social media links, and personalize your profile.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-2xl sm:text-3xl font-bold text-white shadow-glow">
                3
              </div>
              <h4 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4">Share & Grow</h4>
              <p className="text-sm sm:text-base text-gray-300 px-4">
                Share your spotlight.com/username link everywhere and watch your audience grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl p-8 sm:p-12 border border-white/10 backdrop-blur-sm">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 text-balance">
              Ready to Shine?
            </h3>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto text-balance">
              Join musicians who are already using Spotlight to grow their audience and showcase their music.
            </p>
            <Link
              to="/register"
              className="inline-block px-6 py-3 sm:px-8 sm:py-4 bg-gradient-primary hover:bg-gradient-primary-hover text-white font-semibold rounded-xl text-base sm:text-lg transition-all transform hover:scale-105 shadow-glow-lg active:scale-95"
            >
              Get Started Free
            </Link>
            <p className="text-gray-400 text-xs sm:text-sm mt-4">No credit card required • Setup in minutes</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                </svg>
              </div>
              <span className="text-white font-semibold text-sm sm:text-base">Spotlight</span>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-right">
              © 2025 Spotlight. Built for musicians, by musicians.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
