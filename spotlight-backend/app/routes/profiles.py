from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, UserProfile, SocialLink, MusicShowcase
from app.utils import validate_url

profiles_bp = Blueprint('profiles', __name__)

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
    ---
    tags:
      - Profiles
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            display_name:
              type: string
              example: John Doe
            bio:
              type: string
              example: Independent artist from New York
            avatar_url:
              type: string
              format: uri
              example: https://example.com/avatar.jpg
            theme_settings:
              type: object
              description: Theme customization settings
            is_public:
              type: boolean
              example: true
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
    
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Ensure profile exists
    if not user.profile:
        profile = UserProfile(user_id=user.id, display_name=user.username)
        db.session.add(profile)
        db.session.commit()
        user = User.query.get(current_user_id)  # Refresh
    
    profile = user.profile
    
    # Update fields
    if 'display_name' in data:
        profile.display_name = data['display_name'].strip() if data['display_name'] else None
    
    if 'bio' in data:
        profile.bio = data['bio'].strip() if data['bio'] else None
    
    if 'avatar_url' in data:
        avatar_url = data['avatar_url'].strip() if data['avatar_url'] else None
        if avatar_url and not validate_url(avatar_url):
            return jsonify({'error': 'Invalid avatar URL'}), 400
        profile.avatar_url = avatar_url
    
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
