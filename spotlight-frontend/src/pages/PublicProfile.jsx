import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

const PublicProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const carouselRef = useRef(null);
  const autoPlayIntervalRef = useRef(null);
  const hasTrackedClick = useRef(false);

  useEffect(() => {
    // Reset tracking flag when username changes
    hasTrackedClick.current = false;
    fetchProfile();
    setCurrentSlide(0); // Reset to first slide when profile changes
    setIsAutoPlaying(false); // Stop autoplay when profile changes
  }, [username]);

  // Get music_showcase from profile
  const music_showcase = profile?.music_showcase;

  const goToNext = useCallback(() => {
    if (music_showcase && music_showcase.length > 0) {
      setCurrentSlide((prev) => (prev === music_showcase.length - 1 ? 0 : prev + 1));
    }
  }, [music_showcase]);

  const goToPrevious = useCallback(() => {
    if (music_showcase && music_showcase.length > 0) {
      setCurrentSlide((prev) => (prev === 0 ? music_showcase.length - 1 : prev - 1));
    }
  }, [music_showcase]);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && music_showcase && music_showcase.length > 1) {
      autoPlayIntervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev === music_showcase.length - 1 ? 0 : prev + 1));
      }, 5000);
    } else {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    }
    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    };
  }, [isAutoPlaying, music_showcase]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!music_showcase || music_showcase.length <= 1) return;
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [music_showcase, goToNext, goToPrevious]);

  // Enhanced touch handlers for smooth swipe gestures
  const minSwipeDistance = 30; // Lower threshold for easier swiping

  const onTouchStart = (e) => {
    if (!music_showcase || music_showcase.length <= 1) return;
    setIsDragging(true);
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null);
    setDragOffset(0);
    // Pause autoplay while dragging
    if (isAutoPlaying) {
      setIsAutoPlaying(false);
    }
  };

  const onTouchMove = (e) => {
    if (!touchStart || !music_showcase || music_showcase.length <= 1) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    const distance = touchStart - currentTouch;
    setDragOffset(distance);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !music_showcase || music_showcase.length <= 1) {
      setIsDragging(false);
      setDragOffset(0);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    // Check swipe velocity for momentum-based navigation
    const swipeVelocity = Math.abs(distance);
    const shouldSwipe = swipeVelocity > minSwipeDistance || Math.abs(distance) > 50;
    
    // Swipe left goes to next, swipe right goes to previous
    if (isLeftSwipe && shouldSwipe) {
      goToNext();
    } else if (isRightSwipe && shouldSwipe) {
      goToPrevious();
    }
    
    setIsDragging(false);
    setDragOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Mouse handlers for desktop drag support
  const onMouseDown = (e) => {
    if (!music_showcase || music_showcase.length <= 1) return;
    setIsDragging(true);
    setTouchStart(e.clientX);
    setTouchEnd(null);
    setDragOffset(0);
    if (isAutoPlaying) {
      setIsAutoPlaying(false);
    }
  };

  const onMouseMove = (e) => {
    if (!touchStart || !isDragging || !music_showcase || music_showcase.length <= 1) return;
    const currentX = e.clientX;
    setTouchEnd(currentX);
    const distance = touchStart - currentX;
    setDragOffset(distance);
  };

  const onMouseUp = () => {
    if (!touchStart || !touchEnd || !music_showcase || music_showcase.length <= 1) {
      setIsDragging(false);
      setDragOffset(0);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    const shouldSwipe = Math.abs(distance) > minSwipeDistance;
    
    // Swipe left goes to next, swipe right goes to previous
    if (isLeftSwipe && shouldSwipe) {
      goToNext();
    } else if (isRightSwipe && shouldSwipe) {
      goToPrevious();
    }
    
    setIsDragging(false);
    setDragOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Calculate transform with drag offset for real-time feedback
  const getTransform = () => {
    if (!music_showcase || music_showcase.length === 0) return 'translateX(0)';
    const baseTransform = -currentSlide * 100;
    // Clamp drag offset to prevent over-scrolling
    const maxDrag = carouselRef.current?.offsetWidth || 0;
    const clampedOffset = Math.max(-maxDrag * 0.3, Math.min(maxDrag * 0.3, dragOffset));
    return `translateX(calc(${baseTransform}% + ${clampedOffset}px))`;
  };

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/profiles/${username}`);
      setProfile(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Profile not found');
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

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Profile Not Found</h1>
          <p className="text-gray-400">{error || 'This profile does not exist or is not public.'}</p>
        </div>
      </div>
    );
  }

  const { profile: profileData, social_links } = profile;

  // Get avatar URL - handle both uploaded files and external URLs
  const getAvatarUrl = () => {
    if (!profileData.avatar_url) return null;
    // If it's a relative path (uploaded file), construct full URL
    if (profileData.avatar_url.startsWith('/api/uploads/')) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';
      return baseUrl.replace('/api', '') + profileData.avatar_url;
    }
    // Otherwise it's an external URL
    return profileData.avatar_url;
  };
  const avatarUrl = getAvatarUrl();

  return (
    <div className="min-h-screen bg-gradient-dark overflow-x-hidden">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt={profileData.display_name || username}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mx-auto mb-4 border-4 border-white/10 object-cover shadow-glow"
            />
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-light mb-2 text-balance">
            {profileData.display_name || username}
          </h1>
          {profileData.bio && (
            <p className="text-gray-300 text-base sm:text-lg px-4 text-balance">{profileData.bio}</p>
          )}
        </div>

        {/* Social Links */}
        {social_links && social_links.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-primary-light mb-3 sm:mb-4">Connect</h2>
            <div className="space-y-2 sm:space-y-3">
              {social_links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-primary/20 to-accent/20 hover:from-primary/30 hover:to-accent/30 border border-primary/40 rounded-xl text-white font-medium transition-all text-center hover:border-primary/60 hover:shadow-glow active:scale-[0.98]"
                >
                  {link.display_text || link.platform}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Music Showcase Carousel */}
        {music_showcase && music_showcase.length > 0 && (
          <div className="overflow-hidden">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-primary-light">Music</h2>
              {music_showcase.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-primary-light">
                    <span className="text-accent font-semibold">{currentSlide + 1}</span> / {music_showcase.length}
                  </span>
                  {/* Debug: Show actual count */}
                  <span className="text-xs text-primary/50 hidden">Items: {music_showcase.length}</span>
                  <button
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className={`p-1.5 sm:p-2 rounded-lg transition-all ${
                      isAutoPlaying
                        ? 'bg-gradient-primary text-white shadow-glow'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                    aria-label={isAutoPlaying ? 'Pause autoplay' : 'Start autoplay'}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                      {isAutoPlaying ? (
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      ) : (
                        <path d="M8 5v14l11-7z" />
                      )}
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <div 
              className="relative group touch-none select-none overflow-hidden"
              ref={carouselRef}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            >
              {/* Carousel Container */}
              <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 shadow-glow-lg">
                <div 
                  className="flex"
                  style={{ 
                    transform: getTransform(),
                    transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }}
                >
                  {music_showcase.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="min-w-full flex-shrink-0 p-3 sm:p-4 md:p-6"
                    >
                      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/5 via-primary/5 to-accent/5 backdrop-blur-sm border border-primary/20 hover:border-primary/50 transition-colors duration-300">
                        <div 
                          className="absolute inset-0 z-10"
                          style={{ 
                            pointerEvents: isDragging ? 'auto' : 'none',
                            touchAction: 'none'
                          }}
                        />
                        <iframe
                          src={`https://open.spotify.com/embed/album/${item.spotify_item_id}?utm_source=generator`}
                          width="100%"
                          height="352"
                          frameBorder="0"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                          style={{ 
                            pointerEvents: isDragging ? 'none' : 'auto',
                            borderRadius: '0.5rem'
                          }}
                        />
                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/0 via-transparent to-transparent opacity-0 hover:opacity-10 transition-opacity duration-300 pointer-events-none rounded-xl" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Bar */}
              {music_showcase.length > 1 && (
                <div className="h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-primary transition-all duration-700 ease-out shadow-glow"
                    style={{ width: `${((currentSlide + 1) / music_showcase.length) * 100}%` }}
                  />
                </div>
              )}

              {/* Navigation Arrows - Hidden on mobile, visible on desktop */}
              {music_showcase.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="hidden sm:flex absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-14 sm:h-14 bg-gradient-to-br from-black/70 to-black/50 hover:from-black/90 hover:to-black/70 backdrop-blur-md rounded-full items-center justify-center text-white transition-all duration-300 hover:scale-110 active:scale-95 border border-white/20 shadow-lg opacity-0 group-hover:opacity-100 z-10 group"
                    aria-label="Previous"
                  >
                    <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-0 group-hover:opacity-20 transition-opacity" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="hidden sm:flex absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-14 sm:h-14 bg-gradient-to-br from-black/70 to-black/50 hover:from-black/90 hover:to-black/70 backdrop-blur-md rounded-full items-center justify-center text-white transition-all duration-300 hover:scale-110 active:scale-95 border border-white/20 shadow-lg opacity-0 group-hover:opacity-100 z-10 group"
                    aria-label="Next"
                  >
                    <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-0 group-hover:opacity-20 transition-opacity" />
                  </button>
                </>
              )}

              {/* Modern Indicator Dots */}
              {music_showcase && music_showcase.length > 0 && (
                <div className="flex justify-center items-center gap-2.5 sm:gap-3 mt-4 w-full overflow-visible">
                  {Array.from({ length: music_showcase.length }, (_, index) => {
                    const isActive = index === currentSlide;
                    return (
                      <button
                        key={`dot-${index}`}
                        onClick={() => setCurrentSlide(index)}
                        className={`relative transition-all duration-300 flex-shrink-0 z-10 ${
                          isActive
                            ? 'w-10 h-2.5 sm:w-12 sm:h-3'
                            : 'w-2.5 h-2.5 sm:w-3 sm:h-3'
                        }`}
                        style={{ minWidth: isActive ? '2.5rem' : '0.625rem' }}
                        aria-label={`Go to slide ${index + 1} of ${music_showcase.length}`}
                      >
                        <div
                          className={`w-full h-full rounded-full transition-all duration-300 ${
                            isActive
                              ? 'bg-white shadow-lg'
                              : 'bg-white/60 hover:bg-white/80'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 sm:mt-12 text-center">
          <p className="text-gray-500 text-xs sm:text-sm">
            Powered by <span className="text-primary font-semibold">Spotlight</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;



