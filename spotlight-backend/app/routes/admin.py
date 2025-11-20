from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps
from app import db
from app.models import User, UserProfile, SocialLink, MusicShowcase, SpotifyConnection

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    """Decorator to require admin access"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
@admin_required
def get_stats():
    """
    Get Admin Statistics
    Retrieve platform statistics
    ---
    tags:
      - Admin
    security:
      - Bearer: []
    responses:
      200:
        description: Statistics retrieved successfully
      403:
        description: Admin access required
    """
    try:
        total_users = User.query.count()
        total_profiles = UserProfile.query.count()
        total_social_links = SocialLink.query.count()
        total_showcase_items = MusicShowcase.query.count()
        total_spotify_connections = SpotifyConnection.query.count()
        public_profiles = UserProfile.query.filter_by(is_public=True).count()
        
        return jsonify({
            'total_users': total_users,
            'total_profiles': total_profiles,
            'total_social_links': total_social_links,
            'total_showcase_items': total_showcase_items,
            'total_spotify_connections': total_spotify_connections,
            'public_profiles': public_profiles
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to retrieve statistics', 'details': str(e)}), 500

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_users():
    """
    Get All Users
    Retrieve list of all users (admin only)
    ---
    tags:
      - Admin
    security:
      - Bearer: []
    parameters:
      - in: query
        name: page
        type: integer
        default: 1
      - in: query
        name: per_page
        type: integer
        default: 20
    responses:
      200:
        description: Users retrieved successfully
      403:
        description: Admin access required
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        per_page = min(per_page, 100)  # Limit max per_page
        
        users = User.query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            'users': [user.to_dict() for user in users.items],
            'total': users.total,
            'page': page,
            'per_page': per_page,
            'pages': users.pages
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to retrieve users', 'details': str(e)}), 500

@admin_bp.route('/users/<int:user_id>/toggle-admin', methods=['POST'])
@jwt_required()
@admin_required
def toggle_admin(user_id):
    """
    Toggle Admin Status
    Grant or revoke admin access for a user
    ---
    tags:
      - Admin
    security:
      - Bearer: []
    parameters:
      - in: path
        name: user_id
        type: integer
        required: true
    responses:
      200:
        description: Admin status updated successfully
      403:
        description: Admin access required
      404:
        description: User not found
    """
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Prevent removing admin from yourself
        current_user_id = get_jwt_identity()
        if user.id == current_user_id:
            return jsonify({'error': 'Cannot modify your own admin status'}), 400
        
        user.is_admin = not user.is_admin
        db.session.commit()
        
        return jsonify({
            'message': 'Admin status updated successfully',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update admin status', 'details': str(e)}), 500

