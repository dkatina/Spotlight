from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import MusicShowcase, User
from app.services import SpotifyService

music_showcase_bp = Blueprint('music_showcase', __name__)

@music_showcase_bp.route('', methods=['GET'])
@jwt_required()
def get_music_showcase():
    """
    Get Music Showcase
    Retrieve all items in the user's music showcase
    ---
    tags:
      - Music Showcase
    security:
      - Bearer: []
    responses:
      200:
        description: Music showcase retrieved successfully
        schema:
          type: object
          properties:
            items:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: integer
                  user_id:
                    type: integer
                  spotify_item_id:
                    type: string
                  item_type:
                    type: string
                    enum: [album, single, ep]
                  item_name:
                    type: string
                  artist_names:
                    type: string
                  image_url:
                    type: string
                  spotify_url:
                    type: string
                  position:
                    type: integer
      401:
        description: Unauthorized
    """
    current_user_id = get_jwt_identity()
    items = MusicShowcase.query.filter_by(user_id=current_user_id).order_by(MusicShowcase.position).all()
    
    return jsonify({
        'items': [item.to_dict() for item in items]
    }), 200

@music_showcase_bp.route('', methods=['POST'])
@jwt_required()
def add_to_showcase():
    """
    Add Item to Music Showcase
    Add a Spotify album, single, or EP to the music showcase (max 5 items)
    ---
    tags:
      - Music Showcase
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - spotify_item_id
          properties:
            spotify_item_id:
              type: string
              description: Spotify album/single/EP ID
              example: 4uLU6hMCjMI75M1A2tKUQC
    responses:
      201:
        description: Item added to showcase successfully
        schema:
          type: object
          properties:
            message:
              type: string
            item:
              type: object
      400:
        description: Invalid input or showcase limit reached
      401:
        description: Spotify not connected or unauthorized
      409:
        description: Item already in showcase
      500:
        description: Failed to add item to showcase
    """
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    spotify_item_id = data.get('spotify_item_id', '').strip()
    
    if not spotify_item_id:
        return jsonify({'error': 'spotify_item_id is required'}), 400
    
    # Check if user has Spotify connected
    user = User.query.get(current_user_id)
    if not user or not user.spotify_connection:
        return jsonify({'error': 'Spotify not connected'}), 401
    
    # Check showcase limit (5 items for MVP)
    existing_count = MusicShowcase.query.filter_by(user_id=current_user_id).count()
    if existing_count >= 5:
        return jsonify({'error': 'Showcase limit reached (5 items maximum)'}), 400
    
    # Check if item already exists
    existing = MusicShowcase.query.filter_by(
        user_id=current_user_id,
        spotify_item_id=spotify_item_id
    ).first()
    
    if existing:
        return jsonify({'error': 'Item already in showcase'}), 409
    
    # Get album details from Spotify
    access_token = SpotifyService.get_valid_access_token(current_user_id)
    if not access_token:
        return jsonify({'error': 'Failed to get Spotify access token'}), 500
    
    album_data = SpotifyService.get_album_details(access_token, spotify_item_id)
    
    if not album_data:
        return jsonify({'error': 'Failed to fetch album details from Spotify'}), 404
    
    # Extract data
    album_type = album_data.get('album_type', 'album')
    if album_type == 'single':
        item_type = 'single'
    elif album_type == 'ep':
        item_type = 'ep'
    else:
        item_type = 'album'
    
    artists = album_data.get('artists', [])
    artist_names = ', '.join([artist.get('name', '') for artist in artists])
    
    images = album_data.get('images', [])
    image_url = images[0].get('url', '') if images else None
    
    # Get current max position
    max_position = db.session.query(db.func.max(MusicShowcase.position)).filter_by(user_id=current_user_id).scalar() or -1
    
    # Create showcase item
    showcase_item = MusicShowcase(
        user_id=current_user_id,
        spotify_item_id=spotify_item_id,
        item_type=item_type,
        item_name=album_data.get('name', ''),
        artist_names=artist_names,
        image_url=image_url,
        spotify_url=album_data.get('external_urls', {}).get('spotify', ''),
        position=max_position + 1
    )
    
    try:
        db.session.add(showcase_item)
        db.session.commit()
        return jsonify({
            'message': 'Item added to showcase successfully',
            'item': showcase_item.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to add item to showcase', 'details': str(e)}), 500

@music_showcase_bp.route('/<int:item_id>', methods=['DELETE'])
@jwt_required()
def remove_from_showcase(item_id):
    """
    Remove Item from Music Showcase
    Remove an item from the music showcase
    ---
    tags:
      - Music Showcase
    security:
      - Bearer: []
    parameters:
      - in: path
        name: item_id
        type: integer
        required: true
        description: ID of the showcase item to remove
    responses:
      200:
        description: Item removed from showcase successfully
        schema:
          type: object
          properties:
            message:
              type: string
      401:
        description: Unauthorized
      404:
        description: Item not found
      500:
        description: Failed to remove item
    """
    current_user_id = get_jwt_identity()
    item = MusicShowcase.query.filter_by(id=item_id, user_id=current_user_id).first()
    
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    
    try:
        db.session.delete(item)
        db.session.commit()
        return jsonify({'message': 'Item removed from showcase successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to remove item', 'details': str(e)}), 500

@music_showcase_bp.route('/reorder', methods=['PUT'])
@jwt_required()
def reorder_showcase():
    """
    Reorder Music Showcase
    Change the display order of items in the music showcase
    ---
    tags:
      - Music Showcase
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - item_ids
          properties:
            item_ids:
              type: array
              items:
                type: integer
              description: Array of item IDs in desired order
              example: [2, 1, 3]
    responses:
      200:
        description: Showcase reordered successfully
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
        description: Failed to reorder showcase
    """
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or 'item_ids' not in data:
        return jsonify({'error': 'item_ids array is required'}), 400
    
    item_ids = data['item_ids']
    
    if not isinstance(item_ids, list):
        return jsonify({'error': 'item_ids must be an array'}), 400
    
    # Verify all items belong to user
    items = MusicShowcase.query.filter(
        MusicShowcase.id.in_(item_ids),
        MusicShowcase.user_id == current_user_id
    ).all()
    
    if len(items) != len(item_ids):
        return jsonify({'error': 'Some items not found or do not belong to user'}), 400
    
    # Update positions
    try:
        for index, item_id in enumerate(item_ids):
            item = next(i for i in items if i.id == item_id)
            item.position = index
        
        db.session.commit()
        return jsonify({'message': 'Showcase reordered successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to reorder showcase', 'details': str(e)}), 500
