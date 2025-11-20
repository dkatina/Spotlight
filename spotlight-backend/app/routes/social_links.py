from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import SocialLink
from app.utils import validate_url

social_links_bp = Blueprint('social_links', __name__)

@social_links_bp.route('', methods=['GET'])
@jwt_required()
def get_social_links():
    """
    Get Social Links
    Retrieve all social media links for the authenticated user
    ---
    tags:
      - Social Links
    security:
      - Bearer: []
    responses:
      200:
        description: Social links retrieved successfully
        schema:
          type: object
          properties:
            links:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: integer
                  user_id:
                    type: integer
                  platform:
                    type: string
                  url:
                    type: string
                  display_text:
                    type: string
                  position:
                    type: integer
      401:
        description: Unauthorized
    """
    current_user_id = get_jwt_identity()
    links = SocialLink.query.filter_by(user_id=current_user_id).order_by(SocialLink.position).all()
    
    return jsonify({
        'links': [link.to_dict() for link in links]
    }), 200

@social_links_bp.route('', methods=['POST'])
@jwt_required()
def add_social_link():
    """
    Add Social Link
    Add a new social media link to the user's profile
    ---
    tags:
      - Social Links
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - platform
            - url
          properties:
            platform:
              type: string
              example: Instagram
            url:
              type: string
              format: uri
              example: https://instagram.com/artist
            display_text:
              type: string
              example: Follow me on Instagram
    responses:
      201:
        description: Social link added successfully
        schema:
          type: object
          properties:
            message:
              type: string
            link:
              type: object
      400:
        description: Invalid input data
      401:
        description: Unauthorized
      500:
        description: Failed to add social link
    """
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    platform = data.get('platform', '').strip()
    url = data.get('url', '').strip()
    display_text = data.get('display_text', '').strip()
    
    # Validation
    if not platform:
        return jsonify({'error': 'Platform is required'}), 400
    
    if not url or not validate_url(url):
        return jsonify({'error': 'Valid URL is required'}), 400
    
    # Get current max position
    max_position = db.session.query(db.func.max(SocialLink.position)).filter_by(user_id=current_user_id).scalar() or -1
    
    # Create link
    link = SocialLink(
        user_id=current_user_id,
        platform=platform,
        url=url,
        display_text=display_text or platform,
        position=max_position + 1
    )
    
    try:
        db.session.add(link)
        db.session.commit()
        return jsonify({
            'message': 'Social link added successfully',
            'link': link.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to add social link', 'details': str(e)}), 500

@social_links_bp.route('/<int:link_id>', methods=['PUT'])
@jwt_required()
def update_social_link(link_id):
    """
    Update Social Link
    Update an existing social media link
    ---
    tags:
      - Social Links
    security:
      - Bearer: []
    parameters:
      - in: path
        name: link_id
        type: integer
        required: true
        description: ID of the social link to update
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            platform:
              type: string
            url:
              type: string
              format: uri
            display_text:
              type: string
    responses:
      200:
        description: Social link updated successfully
        schema:
          type: object
          properties:
            message:
              type: string
            link:
              type: object
      400:
        description: Invalid input data
      401:
        description: Unauthorized
      404:
        description: Link not found
      500:
        description: Failed to update social link
    """
    current_user_id = get_jwt_identity()
    link = SocialLink.query.filter_by(id=link_id, user_id=current_user_id).first()
    
    if not link:
        return jsonify({'error': 'Link not found'}), 404
    
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Update fields
    if 'platform' in data:
        link.platform = data['platform'].strip()
    
    if 'url' in data:
        url = data['url'].strip()
        if not validate_url(url):
            return jsonify({'error': 'Valid URL is required'}), 400
        link.url = url
    
    if 'display_text' in data:
        link.display_text = data['display_text'].strip() if data['display_text'] else link.platform
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Social link updated successfully',
            'link': link.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update social link', 'details': str(e)}), 500

@social_links_bp.route('/<int:link_id>', methods=['DELETE'])
@jwt_required()
def delete_social_link(link_id):
    """
    Delete Social Link
    Remove a social media link from the user's profile
    ---
    tags:
      - Social Links
    security:
      - Bearer: []
    parameters:
      - in: path
        name: link_id
        type: integer
        required: true
        description: ID of the social link to delete
    responses:
      200:
        description: Social link deleted successfully
        schema:
          type: object
          properties:
            message:
              type: string
      401:
        description: Unauthorized
      404:
        description: Link not found
      500:
        description: Failed to delete social link
    """
    current_user_id = get_jwt_identity()
    link = SocialLink.query.filter_by(id=link_id, user_id=current_user_id).first()
    
    if not link:
        return jsonify({'error': 'Link not found'}), 404
    
    try:
        db.session.delete(link)
        db.session.commit()
        return jsonify({'message': 'Social link deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete social link', 'details': str(e)}), 500

@social_links_bp.route('/reorder', methods=['PUT'])
@jwt_required()
def reorder_social_links():
    """
    Reorder Social Links
    Change the display order of social media links
    ---
    tags:
      - Social Links
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - link_ids
          properties:
            link_ids:
              type: array
              items:
                type: integer
              description: Array of link IDs in desired order
              example: [3, 1, 2]
    responses:
      200:
        description: Links reordered successfully
        schema:
          type: object
          properties:
            message:
              type: string
      400:
        description: Invalid input data
      401:
        description: Unauthorized
      500:
        description: Failed to reorder links
    """
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or 'link_ids' not in data:
        return jsonify({'error': 'link_ids array is required'}), 400
    
    link_ids = data['link_ids']
    
    if not isinstance(link_ids, list):
        return jsonify({'error': 'link_ids must be an array'}), 400
    
    # Verify all links belong to user
    links = SocialLink.query.filter(
        SocialLink.id.in_(link_ids),
        SocialLink.user_id == current_user_id
    ).all()
    
    if len(links) != len(link_ids):
        return jsonify({'error': 'Some links not found or do not belong to user'}), 400
    
    # Update positions
    try:
        for index, link_id in enumerate(link_ids):
            link = next(l for l in links if l.id == link_id)
            link.position = index
        
        db.session.commit()
        return jsonify({'message': 'Links reordered successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to reorder links', 'details': str(e)}), 500
