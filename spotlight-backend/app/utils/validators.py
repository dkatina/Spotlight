import re
from urllib.parse import urlparse

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_username(username):
    """Validate username format"""
    # Username: 3-50 characters, alphanumeric and underscores only
    pattern = r'^[a-zA-Z0-9_]{3,50}$'
    if not re.match(pattern, username):
        return False
    
    # Reserved words
    reserved_words = ['admin', 'api', 'www', 'spotlight', 'spotify', 'auth', 'login', 'register', 'profile', 'settings']
    return username.lower() not in reserved_words

def validate_password(password):
    """Validate password strength"""
    # Minimum 8 characters
    if len(password) < 8:
        return False
    return True

def validate_url(url):
    """Validate URL format"""
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

def validate_spotify_url(url):
    """Validate Spotify URL format"""
    if not validate_url(url):
        return False
    return 'spotify.com' in url or 'open.spotify.com' in url

