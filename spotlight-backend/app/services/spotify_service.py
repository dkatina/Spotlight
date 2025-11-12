import requests
import base64
from datetime import datetime, timedelta
from urllib.parse import urlencode
from flask import current_app
from app import db
from app.models import SpotifyConnection

class SpotifyService:
    """Service for interacting with Spotify API"""
    
    @staticmethod
    def get_auth_url(state=None):
        """Generate Spotify OAuth authorization URL"""
        client_id = current_app.config['SPOTIFY_CLIENT_ID']
        redirect_uri = current_app.config['SPOTIFY_REDIRECT_URI']
        
        scopes = [
            'user-read-private',
            'user-read-email',
            'user-library-read',
            'user-top-read'
        ]
        
        params = {
            'client_id': client_id,
            'response_type': 'code',
            'redirect_uri': redirect_uri,
            'scope': ' '.join(scopes),
            'show_dialog': 'false'
        }
        
        if state:
            params['state'] = state
        
        auth_url = current_app.config['SPOTIFY_AUTH_URL']
        # Use urlencode to properly encode the redirect_uri
        query_string = urlencode(params)
        
        return f"{auth_url}?{query_string}"
    
    @staticmethod
    def exchange_code_for_tokens(code):
        """Exchange authorization code for access and refresh tokens"""
        client_id = current_app.config['SPOTIFY_CLIENT_ID']
        client_secret = current_app.config['SPOTIFY_CLIENT_SECRET']
        redirect_uri = current_app.config['SPOTIFY_REDIRECT_URI']
        
        # Base64 encode client credentials
        credentials = f"{client_id}:{client_secret}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        
        headers = {
            'Authorization': f'Basic {encoded_credentials}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        data = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirect_uri
        }
        
        response = requests.post(
            current_app.config['SPOTIFY_TOKEN_URL'],
            headers=headers,
            data=data
        )
        
        if response.status_code != 200:
            return None
        
        return response.json()
    
    @staticmethod
    def refresh_access_token(refresh_token):
        """Refresh Spotify access token"""
        client_id = current_app.config['SPOTIFY_CLIENT_ID']
        client_secret = current_app.config['SPOTIFY_CLIENT_SECRET']
        
        credentials = f"{client_id}:{client_secret}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        
        headers = {
            'Authorization': f'Basic {encoded_credentials}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        data = {
            'grant_type': 'refresh_token',
            'refresh_token': refresh_token
        }
        
        response = requests.post(
            current_app.config['SPOTIFY_TOKEN_URL'],
            headers=headers,
            data=data
        )
        
        if response.status_code != 200:
            return None
        
        return response.json()
    
    @staticmethod
    def get_user_info(access_token):
        """Get Spotify user information"""
        headers = {
            'Authorization': f'Bearer {access_token}'
        }
        
        response = requests.get(
            f"{current_app.config['SPOTIFY_API_BASE_URL']}/me",
            headers=headers
        )
        
        if response.status_code != 200:
            return None
        
        return response.json()
    
    @staticmethod
    def get_user_albums(access_token, limit=50, offset=0):
        """Get user's saved albums"""
        headers = {
            'Authorization': f'Bearer {access_token}'
        }
        
        params = {
            'limit': limit,
            'offset': offset
        }
        
        response = requests.get(
            f"{current_app.config['SPOTIFY_API_BASE_URL']}/me/albums",
            headers=headers,
            params=params
        )
        
        if response.status_code != 200:
            return None
        
        return response.json()
    
    @staticmethod
    def get_album_details(access_token, album_id):
        """Get detailed album information"""
        headers = {
            'Authorization': f'Bearer {access_token}'
        }
        
        response = requests.get(
            f"{current_app.config['SPOTIFY_API_BASE_URL']}/albums/{album_id}",
            headers=headers
        )
        
        if response.status_code != 200:
            return None
        
        return response.json()
    
    @staticmethod
    def get_valid_access_token(user_id):
        """Get valid access token for user, refreshing if necessary"""
        connection = SpotifyConnection.query.filter_by(user_id=user_id).first()
        
        if not connection:
            return None
        
        # Check if token is expired
        if connection.is_token_expired():
            # Refresh the token
            token_data = SpotifyService.refresh_access_token(connection.refresh_token)
            
            if not token_data:
                return None
            
            # Update connection
            connection.access_token = token_data['access_token']
            if 'refresh_token' in token_data:
                connection.refresh_token = token_data['refresh_token']
            
            expires_in = token_data.get('expires_in', 3600)
            connection.token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
            
            db.session.commit()
        
        return connection.access_token

