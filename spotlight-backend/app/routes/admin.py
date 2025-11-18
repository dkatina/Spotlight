from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, LinkClick

admin_bp = Blueprint('admin', __name__)

# Admin email constant
ADMIN_EMAIL = 'dylankatina@gmail.com'

def is_admin():
    """Check if the current user is an admin"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    return user and user.email.lower() == ADMIN_EMAIL.lower()

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_admin_stats():
    """
    Get Admin Statistics
    Retrieve platform statistics (user count, total link clicks)
    Only accessible to admin users (dylankatina@gmail.com)
    ---
    tags:
      - Admin
    security:
      - Bearer: []
    responses:
      200:
        description: Statistics retrieved successfully
        schema:
          type: object
          properties:
            total_users:
              type: integer
              description: Total number of registered users
            total_link_clicks:
              type: integer
              description: Total number of link clicks across all users
      401:
        description: Unauthorized - not an admin user
      403:
        description: Forbidden - admin access required
    """
    # Check if user is admin
    if not is_admin():
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        # Get total user count
        total_users = User.query.count()
        
        # Get total link clicks
        total_link_clicks = LinkClick.query.count()
        
        return jsonify({
            'total_users': total_users,
            'total_link_clicks': total_link_clicks
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to retrieve statistics', 'details': str(e)}), 500

