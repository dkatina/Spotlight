from datetime import datetime
from app import db
from werkzeug.security import generate_password_hash, check_password_hash
import json

class User(db.Model):
    """User model for authentication"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    profile = db.relationship('UserProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    social_links = db.relationship('SocialLink', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    spotify_connection = db.relationship('SpotifyConnection', backref='user', uselist=False, cascade='all, delete-orphan')
    music_showcase = db.relationship('MusicShowcase', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check password against hash"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convert user to dictionary"""
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class UserProfile(db.Model):
    """User profile model"""
    __tablename__ = 'user_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True)
    display_name = db.Column(db.String(100))
    bio = db.Column(db.Text)
    avatar_url = db.Column(db.String(500))
    theme_settings = db.Column(db.JSON, default=dict)
    is_public = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert profile to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'display_name': self.display_name,
            'bio': self.bio,
            'avatar_url': self.avatar_url,
            'theme_settings': self.theme_settings or {},
            'is_public': self.is_public,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class SocialLink(db.Model):
    """Social media links model"""
    __tablename__ = 'social_links'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    platform = db.Column(db.String(50), nullable=False)
    url = db.Column(db.String(500), nullable=False)
    display_text = db.Column(db.String(100))
    position = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert social link to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'platform': self.platform,
            'url': self.url,
            'display_text': self.display_text,
            'position': self.position,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class SpotifyConnection(db.Model):
    """Spotify OAuth connection model"""
    __tablename__ = 'spotify_connections'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True)
    spotify_user_id = db.Column(db.String(100), nullable=False)
    artist_id = db.Column(db.String(100), nullable=True)
    access_token = db.Column(db.Text, nullable=False)
    refresh_token = db.Column(db.Text, nullable=False)
    token_expires_at = db.Column(db.DateTime)
    connected_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def is_token_expired(self):
        """Check if access token is expired"""
        if not self.token_expires_at:
            return True
        return datetime.utcnow() >= self.token_expires_at
    
    def to_dict(self):
        """Convert connection to dictionary (without sensitive tokens)"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'spotify_user_id': self.spotify_user_id,
            'artist_id': self.artist_id,
            'connected_at': self.connected_at.isoformat() if self.connected_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class MusicShowcase(db.Model):
    """Music showcase items model"""
    __tablename__ = 'music_showcase'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    spotify_item_id = db.Column(db.String(100), nullable=False)
    item_type = db.Column(db.String(20), nullable=False)  # 'album', 'single', 'ep', 'track'
    item_name = db.Column(db.String(200), nullable=False)
    artist_names = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(500))
    spotify_url = db.Column(db.String(300), nullable=False)
    position = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert showcase item to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'spotify_item_id': self.spotify_item_id,
            'item_type': self.item_type,
            'item_name': self.item_name,
            'artist_names': self.artist_names,
            'image_url': self.image_url,
            'spotify_url': self.spotify_url,
            'position': self.position,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

