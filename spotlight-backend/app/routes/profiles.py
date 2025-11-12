from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, UserProfile, SocialLink, MusicShowcase
from app.utils import validate_url
import os
import uuid

profiles_bp = Blueprint('profiles', __name__)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

def save_avatar_file(file, user_id):
    """Save uploaded avatar file and return the URL path"""
    if file and allowed_file(file.filename):
        # Create upload directory if it doesn't exist
        upload_folder = current_app.config['UPLOAD_FOLDER']
        os.makedirs(upload_folder, exist_ok=True)
        
        # Generate unique filename
        ext = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{user_id}_{uuid.uuid4().hex[:8]}.{ext}"
        filepath = os.path.join(upload_folder, filename)
        
        # Save file
        file.save(filepath)
        
        # Return URL path (relative to static route)
        return f"/api/uploads/avatars/{filename}"
    return None

@profiles_bp.route('/<username>', methods=['GET'])
def get_public_profile(username):
    """
    Get Public Profile
    Retrieve public profile information by username
    ---
    tags:
      - Profiles
    parameters:
      - in: path
        name: username
        type: string
        required: true
        description: Username of the profile to retrieve
    responses:
      200:
        description: Public profile retrieved successfully
        schema:
          type: object
          properties:
            username:
              type: string
            profile:
              type: object
              properties:
                display_name:
                  type: string
                bio:
                  type: string
                avatar_url:
                  type: string
                theme_settings:
                  type: object
            social_links:
              type: array
              items:
                type: object
            music_showcase:
              type: array
              items:
                type: object
      403:
        description: Profile is not public
      404:
        description: Profile not found
    """
    user = User.query.filter_by(username=username).first()
    
    if not user:
        return jsonify({'error': 'Profile not found'}), 404
    
    # Check if profile is public
    if not user.profile or not user.profile.is_public:
        return jsonify({'error': 'Profile is not public'}), 403
    
    # Get social links
    social_links = [link.to_dict() for link in user.social_links.order_by(SocialLink.position).all()]
    
    # Get music showcase
    showcase_items = [item.to_dict() for item in user.music_showcase.order_by(MusicShowcase.position).all()]
    
    return jsonify({
        'username': user.username,
        'profile': user.profile.to_dict(),
        'social_links': social_links,
        'music_showcase': showcase_items
    }), 200

@profiles_bp.route('/me', methods=['GET'])
@jwt_required()
def get_my_profile():
    """
    Get Current User Profile
    Retrieve authenticated user's complete profile data
    ---
    tags:
      - Profiles
    security:
      - Bearer: []
    responses:
      200:
        description: Profile retrieved successfully
        schema:
          type: object
          properties:
            user:
              type: object
            profile:
              type: object
            social_links:
              type: array
              items:
                type: object
            music_showcase:
              type: array
              items:
                type: object
            spotify_connected:
              type: boolean
      401:
        description: Unauthorized
      404:
        description: User not found
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Ensure profile exists
    if not user.profile:
        profile = UserProfile(user_id=user.id, display_name=user.username)
        db.session.add(profile)
        db.session.commit()
        user = User.query.get(current_user_id)  # Refresh
    
    # Get social links
    social_links = [link.to_dict() for link in user.social_links.order_by(SocialLink.position).all()]
    
    # Get music showcase
    showcase_items = [item.to_dict() for item in user.music_showcase.order_by(MusicShowcase.position).all()]
    
    # Get Spotify connection status
    spotify_connected = user.spotify_connection is not None
    
    return jsonify({
        'user': user.to_dict(),
        'profile': user.profile.to_dict(),
        'social_links': social_links,
        'music_showcase': showcase_items,
        'spotify_connected': spotify_connected
    }), 200

@profiles_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_profile():
    """
    Update User Profile
    Update authenticated user's profile information
    Supports both JSON and multipart/form-data (for file uploads)
    ---
    tags:
      - Profiles
    security:
      - Bearer: []
    consumes:
      - application/json
      - multipart/form-data
    parameters:
      - in: formData
        name: display_name
        type: string
        required: false
      - in: formData
        name: bio
        type: string
        required: false
      - in: formData
        name: avatar
        type: file
        required: false
        description: Avatar image file (png, jpg, jpeg, gif, webp, max 5MB)
      - in: formData
        name: is_public
        type: boolean
        required: false
    responses:
      200:
        description: Profile updated successfully
        schema:
          type: object
          properties:
            message:
              type: string
              example: Profile updated successfully
            profile:
              type: object
      400:
        description: Invalid input data
      401:
        description: Unauthorized
      404:
        description: User not found
      500:
        description: Failed to update profile
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Ensure profile exists
    if not user.profile:
        profile = UserProfile(user_id=user.id, display_name=user.username)
        db.session.add(profile)
        db.session.commit()
        user = User.query.get(current_user_id)  # Refresh
    
    profile = user.profile
    
    # Handle multipart/form-data (file upload)
    if request.content_type and 'multipart/form-data' in request.content_type:
        # Handle file upload
        if 'avatar' in request.files:
            avatar_file = request.files['avatar']
            if avatar_file.filename:
                # Delete old avatar file if it exists and is a local file
                if profile.avatar_url and profile.avatar_url.startswith('/api/uploads/'):
                    old_filename = profile.avatar_url.split('/')[-1]
                    old_filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], old_filename)
                    if os.path.exists(old_filepath):
                        try:
                            os.remove(old_filepath)
                        except Exception:
                            pass  # Ignore errors when deleting old file
                
                # Save new avatar
                avatar_url = save_avatar_file(avatar_file, current_user_id)
                if avatar_url:
                    profile.avatar_url = avatar_url
                else:
                    return jsonify({'error': 'Invalid file type. Allowed: png, jpg, jpeg, gif, webp'}), 400
        
        # Handle avatar removal
        if 'remove_avatar' in request.form and request.form['remove_avatar'].lower() in ('true', '1', 'yes'):
            # Delete old avatar file if it exists and is a local file
            if profile.avatar_url and profile.avatar_url.startswith('/api/uploads/'):
                old_filename = profile.avatar_url.split('/')[-1]
                old_filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], old_filename)
                if os.path.exists(old_filepath):
                    try:
                        os.remove(old_filepath)
                    except Exception:
                        pass  # Ignore errors when deleting old file
            profile.avatar_url = None
        
        # Handle other form fields
        if 'display_name' in request.form:
            profile.display_name = request.form['display_name'].strip() if request.form['display_name'] else None
        
        if 'bio' in request.form:
            profile.bio = request.form['bio'].strip() if request.form['bio'] else None
        
        if 'is_public' in request.form:
            profile.is_public = request.form['is_public'].lower() in ('true', '1', 'yes')
    
    # Handle JSON data (backward compatibility)
    else:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Update fields
        if 'display_name' in data:
            profile.display_name = data['display_name'].strip() if data['display_name'] else None
        
        if 'bio' in data:
            profile.bio = data['bio'].strip() if data['bio'] else None
        
        # Only update avatar_url if provided (for backward compatibility with URL-based avatars)
        if 'avatar_url' in data:
            avatar_url = data['avatar_url'].strip() if data['avatar_url'] else None
            if avatar_url:
                # If it's a URL, validate it
                if avatar_url.startswith('http://') or avatar_url.startswith('https://'):
                    if not validate_url(avatar_url):
                        return jsonify({'error': 'Invalid avatar URL'}), 400
                    profile.avatar_url = avatar_url
                # If it's empty string, clear the avatar
                elif not avatar_url:
                    # Delete old file if it's a local file
                    if profile.avatar_url and profile.avatar_url.startswith('/api/uploads/'):
                        old_filename = profile.avatar_url.split('/')[-1]
                        old_filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], old_filename)
                        if os.path.exists(old_filepath):
                            try:
                                os.remove(old_filepath)
                            except Exception:
                                pass
                    profile.avatar_url = None
        
        if 'theme_settings' in data:
            if isinstance(data['theme_settings'], dict):
                profile.theme_settings = data['theme_settings']
        
        if 'is_public' in data:
            profile.is_public = bool(data['is_public'])
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Profile updated successfully',
            'profile': profile.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update profile', 'details': str(e)}), 500

