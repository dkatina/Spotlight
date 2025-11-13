from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, SpotifyConnection
from app.services import SpotifyService
from datetime import datetime, timedelta

spotify_bp = Blueprint('spotify', __name__)

@spotify_bp.route('/auth-url', methods=['GET'])
@jwt_required()
def get_auth_url():
    """
    Get Spotify OAuth Authorization URL
    Retrieve the URL to redirect users for Spotify OAuth authentication
    ---
    tags:
      - Spotify
    security:
      - Bearer: []
    parameters:
      - in: query
        name: state
        type: string
        required: false
        description: Optional state parameter for OAuth flow
    responses:
      200:
        description: Authorization URL retrieved successfully
        schema:
          type: object
          properties:
            auth_url:
              type: string
              example: https://accounts.spotify.com/authorize?client_id=...
      401:
        description: Unauthorized
    """
    state = request.args.get('state')
    auth_url = SpotifyService.get_auth_url(state=state)
    
    return jsonify({
        'auth_url': auth_url
    }), 200

@spotify_bp.route('/callback', methods=['POST'])
@jwt_required()
def handle_callback():
    """
    Handle Spotify OAuth Callback
    Exchange authorization code for access tokens and save connection
    ---
    tags:
      - Spotify
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - code
          properties:
            code:
              type: string
              description: Authorization code from Spotify OAuth callback
              example: AQCy...
    responses:
      200:
        description: Spotify connected successfully
        schema:
          type: object
          properties:
            message:
              type: string
              example: Spotify connected successfully
            connection:
              type: object
              properties:
                id:
                  type: integer
                user_id:
                  type: integer
                spotify_user_id:
                  type: string
                connected_at:
                  type: string
      400:
        description: Invalid authorization code or missing code
      401:
        description: Unauthorized
      500:
        description: Failed to save connection
    """
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or 'code' not in data:
        return jsonify({'error': 'Authorization code required'}), 400
    
    code = data.get('code')
    
    # Exchange code for tokens
    token_data = SpotifyService.exchange_code_for_tokens(code)
    
    if not token_data:
        return jsonify({'error': 'Failed to exchange authorization code'}), 400
    
    # Get user info from Spotify
    access_token = token_data['access_token']
    user_info = SpotifyService.get_user_info(access_token)
    
    if not user_info:
        return jsonify({'error': 'Failed to get user info from Spotify'}), 400
    
    # Calculate token expiration
    expires_in = token_data.get('expires_in', 3600)
    expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
    
    # Save or update connection
    connection = SpotifyConnection.query.filter_by(user_id=current_user_id).first()
    
    if connection:
        connection.spotify_user_id = user_info['id']
        connection.access_token = token_data['access_token']
        connection.refresh_token = token_data['refresh_token']
        connection.token_expires_at = expires_at
        # Preserve existing artist_id if it exists
        connection.updated_at = datetime.utcnow()
    else:
        connection = SpotifyConnection(
            user_id=current_user_id,
            spotify_user_id=user_info['id'],
            access_token=token_data['access_token'],
            refresh_token=token_data['refresh_token'],
            token_expires_at=expires_at
        )
        db.session.add(connection)
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Spotify connected successfully',
            'connection': connection.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to save connection', 'details': str(e)}), 500

@spotify_bp.route('/artist-id', methods=['PUT'])
@jwt_required()
def update_artist_id():
    """
    Update Artist ID
    Manually set or update the artist_id for the user's Spotify connection
    Set to null or empty string to disconnect artist
    ---
    tags:
      - Spotify
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - artist_id
          properties:
            artist_id:
              type: string
              nullable: true
              description: Spotify artist ID (set to null or empty to disconnect)
              example: 4Z8W4fKeB5YxbusRsdQVPb
    responses:
      200:
        description: Artist ID updated successfully
        schema:
          type: object
          properties:
            message:
              type: string
              example: Artist ID updated successfully
            connection:
              type: object
      400:
        description: Invalid request or missing artist_id
      401:
        description: Spotify not connected or unauthorized
      404:
        description: Connection not found
    """
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or 'artist_id' not in data:
        return jsonify({'error': 'artist_id is required'}), 400
    
    artist_id = data.get('artist_id')
    # Allow null or empty string to clear artist_id
    if artist_id == '':
        artist_id = None
    
    # Get connection
    connection = SpotifyConnection.query.filter_by(user_id=current_user_id).first()
    
    if not connection:
        return jsonify({'error': 'Spotify not connected. Please connect your Spotify account first.'}), 404
    
    # Update artist_id
    connection.artist_id = artist_id
    connection.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        message = 'Artist ID disconnected successfully' if artist_id is None else 'Artist ID updated successfully'
        return jsonify({
            'message': message,
            'connection': connection.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update artist ID', 'details': str(e)}), 500

@spotify_bp.route('/artist-id', methods=['DELETE'])
@jwt_required()
def disconnect_artist_id():
    """
    Disconnect Artist ID
    Remove the artist_id from the user's Spotify connection
    ---
    tags:
      - Spotify
    security:
      - Bearer: []
    responses:
      200:
        description: Artist ID disconnected successfully
        schema:
          type: object
          properties:
            message:
              type: string
              example: Artist ID disconnected successfully
            connection:
              type: object
      401:
        description: Spotify not connected or unauthorized
      404:
        description: Connection not found
    """
    current_user_id = get_jwt_identity()
    
    # Get connection
    connection = SpotifyConnection.query.filter_by(user_id=current_user_id).first()
    
    if not connection:
        return jsonify({'error': 'Spotify not connected. Please connect your Spotify account first.'}), 404
    
    # Clear artist_id
    connection.artist_id = None
    connection.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Artist ID disconnected successfully',
            'connection': connection.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to disconnect artist ID', 'details': str(e)}), 500

@spotify_bp.route('/search-artist', methods=['GET'])
@jwt_required()
def search_artist():
    """
    Search for Artists
    Search for artists by name to help users find their artist ID
    ---
    tags:
      - Spotify
    security:
      - Bearer: []
    parameters:
      - in: query
        name: q
        type: string
        required: true
        description: Artist name to search for
        example: Radiohead
      - in: query
        name: limit
        type: integer
        required: false
        default: 10
        description: Maximum number of results to return
    responses:
      200:
        description: Artists found successfully
        schema:
          type: object
          properties:
            artists:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: string
                  name:
                    type: string
                  images:
                    type: array
                  external_urls:
                    type: object
      401:
        description: Spotify not connected or unauthorized
      400:
        description: Missing search query
    """
    current_user_id = get_jwt_identity()
    
    # Get valid access token
    access_token = SpotifyService.get_valid_access_token(current_user_id)
    
    if not access_token:
        return jsonify({'error': 'Spotify not connected. Please connect your Spotify account first.'}), 401
    
    # Get query parameters
    query = request.args.get('q')
    limit = request.args.get('limit', 10, type=int)
    
    if not query:
        return jsonify({'error': 'Search query (q) is required'}), 400
    
    # Search for artists using service
    artists_data = SpotifyService.search_artists(access_token, query, limit=limit)
    
    if not artists_data:
        return jsonify({'error': 'Failed to search for artists'}), 500
    
    artists = artists_data.get('items', [])
    
    # Format response
    formatted_artists = []
    for artist in artists:
        formatted_artists.append({
            'id': artist.get('id'),
            'name': artist.get('name'),
            'images': artist.get('images', []),
            'external_urls': artist.get('external_urls', {}),
            'genres': artist.get('genres', []),
            'popularity': artist.get('popularity')
        })
    
        return jsonify({
            'artists': formatted_artists,
            'total': artists_data.get('total', 0)
        }), 200

@spotify_bp.route('/search-albums', methods=['GET'])
@jwt_required()
def search_albums():
    """
    Search for Albums
    Search for albums by title across all of Spotify
    ---
    tags:
      - Spotify
    security:
      - Bearer: []
    parameters:
      - in: query
        name: q
        type: string
        required: true
        description: Album title to search for
        example: Abbey Road
      - in: query
        name: limit
        type: integer
        required: false
        default: 50
        description: Maximum number of results to return
      - in: query
        name: offset
        type: integer
        required: false
        default: 0
        description: Offset for pagination
    responses:
      200:
        description: Albums found successfully
        schema:
          type: object
          properties:
            items:
              type: array
              items:
                type: object
                properties:
                  spotify_id:
                    type: string
                  item_type:
                    type: string
                  item_name:
                    type: string
                  artist_names:
                    type: string
                  image_url:
                    type: string
                  spotify_url:
                    type: string
                  release_date:
                    type: string
                  total_tracks:
                    type: integer
            total:
              type: integer
      401:
        description: Spotify not connected or unauthorized
      400:
        description: Missing search query
    """
    current_user_id = get_jwt_identity()
    
    # Get valid access token
    access_token = SpotifyService.get_valid_access_token(current_user_id)
    
    if not access_token:
        return jsonify({'error': 'Spotify not connected. Please connect your Spotify account first.'}), 401
    
    # Get query parameters
    query = request.args.get('q')
    limit = request.args.get('limit', 50, type=int)
    offset = request.args.get('offset', 0, type=int)
    
    if not query:
        return jsonify({'error': 'Search query (q) is required'}), 400
    
    # Search for albums using service
    albums_data = SpotifyService.search_albums(access_token, query, limit=limit, offset=offset)
    
    if not albums_data:
        return jsonify({'error': 'Failed to search for albums'}), 500
    
    albums = albums_data.get('items', [])
    
    # Format response to match user-albums format
    formatted_albums = []
    for album in albums:
        # Determine item type
        album_type = album.get('album_type', 'album')
        if album_type == 'single':
            item_type = 'single'
        elif album_type == 'ep':
            item_type = 'ep'
        else:
            item_type = 'album'
        
        # Get artist names
        artists = album.get('artists', [])
        artist_names = ', '.join([artist.get('name', '') for artist in artists])
        
        # Get images
        images = album.get('images', [])
        image_url = images[0].get('url', '') if images else None
        
        formatted_albums.append({
            'spotify_id': album.get('id'),
            'item_type': item_type,
            'item_name': album.get('name', ''),
            'artist_names': artist_names,
            'image_url': image_url,
            'spotify_url': album.get('external_urls', {}).get('spotify', ''),
            'release_date': album.get('release_date', ''),
            'total_tracks': album.get('total_tracks', 0)
        })
    
    return jsonify({
        'items': formatted_albums,
        'total': albums_data.get('total', 0),
        'limit': limit,
        'offset': offset
    }), 200

@spotify_bp.route('/user-albums', methods=['GET'])
@jwt_required()
def get_user_albums():
    """
    Get User's Spotify Albums
    Retrieve user's saved albums, singles, and EPs from Spotify
    ---
    tags:
      - Spotify
    security:
      - Bearer: []
    parameters:
      - in: query
        name: limit
        type: integer
        required: false
        default: 50
        description: Maximum number of items to return
      - in: query
        name: offset
        type: integer
        required: false
        default: 0
        description: Offset for pagination
    responses:
      200:
        description: Albums retrieved successfully
        schema:
          type: object
          properties:
            items:
              type: array
              items:
                type: object
                properties:
                  spotify_id:
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
                  release_date:
                    type: string
                  total_tracks:
                    type: integer
            total:
              type: integer
            limit:
              type: integer
            offset:
              type: integer
      401:
        description: Spotify not connected or unauthorized
      500:
        description: Failed to fetch albums from Spotify
    """
    current_user_id = get_jwt_identity()
    
    # Get valid access token
    access_token = SpotifyService.get_valid_access_token(current_user_id)
    
    if not access_token:
        return jsonify({'error': 'Spotify not connected. Please connect your Spotify account first.'}), 401
    
    # Get connection to check for artist_id
    connection = SpotifyConnection.query.filter_by(user_id=current_user_id).first()
    
    # Get query parameters
    limit = request.args.get('limit', 50, type=int)
    offset = request.args.get('offset', 0, type=int)
    
    # Fetch albums from Spotify - use artist albums if artist_id is available
    if connection and connection.artist_id:
        albums_data = SpotifyService.get_artist_albums(access_token, connection.artist_id, limit=limit, offset=offset)
        
        if not albums_data:
            return jsonify({'error': 'Failed to fetch artist albums from Spotify'}), 500
        
        # Format response for artist albums (different structure)
        items = []
        for album in albums_data.get('items', []):
            # Determine item type
            album_type = album.get('album_type', 'album')
            if album_type == 'single':
                item_type = 'single'
            elif album_type == 'ep':
                item_type = 'ep'
            else:
                item_type = 'album'
            
            # Get artist names
            artists = album.get('artists', [])
            artist_names = ', '.join([artist.get('name', '') for artist in artists])
            
            # Get images
            images = album.get('images', [])
            image_url = images[0].get('url', '') if images else None
            
            items.append({
                'spotify_id': album.get('id'),
                'item_type': item_type,
                'item_name': album.get('name', ''),
                'artist_names': artist_names,
                'image_url': image_url,
                'spotify_url': album.get('external_urls', {}).get('spotify', ''),
                'release_date': album.get('release_date', ''),
                'total_tracks': album.get('total_tracks', 0)
            })
        
        return jsonify({
            'items': items,
            'total': albums_data.get('total', 0),
            'limit': limit,
            'offset': offset
        }), 200
    else:
        # Fall back to user's saved albums
        albums_data = SpotifyService.get_user_albums(access_token, limit=limit, offset=offset)
        
        if not albums_data:
            return jsonify({'error': 'Failed to fetch albums from Spotify'}), 500
        
        # Format response for saved albums
        items = []
        for item in albums_data.get('items', []):
            album = item.get('album', {})
            
            # Determine item type
            album_type = album.get('album_type', 'album')
            if album_type == 'single':
                item_type = 'single'
            elif album_type == 'ep':
                item_type = 'ep'
            else:
                item_type = 'album'
            
            # Get artist names
            artists = album.get('artists', [])
            artist_names = ', '.join([artist.get('name', '') for artist in artists])
            
            # Get images
            images = album.get('images', [])
            image_url = images[0].get('url', '') if images else None
            
            items.append({
                'spotify_id': album.get('id'),
                'item_type': item_type,
                'item_name': album.get('name', ''),
                'artist_names': artist_names,
                'image_url': image_url,
                'spotify_url': album.get('external_urls', {}).get('spotify', ''),
                'release_date': album.get('release_date', ''),
                'total_tracks': album.get('total_tracks', 0)
            })
        
        return jsonify({
            'items': items,
            'total': albums_data.get('total', 0),
            'limit': limit,
            'offset': offset
        }), 200

@spotify_bp.route('/album/<album_id>', methods=['GET'])
@jwt_required()
def get_album_details(album_id):
    """
    Get Album Details
    Retrieve detailed information about a specific Spotify album
    ---
    tags:
      - Spotify
    security:
      - Bearer: []
    parameters:
      - in: path
        name: album_id
        type: string
        required: true
        description: Spotify album ID
    responses:
      200:
        description: Album details retrieved successfully
        schema:
          type: object
          properties:
            spotify_id:
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
            release_date:
              type: string
            total_tracks:
              type: integer
            tracks:
              type: array
              items:
                type: object
      401:
        description: Spotify not connected or unauthorized
      404:
        description: Album not found
    """
    current_user_id = get_jwt_identity()
    
    # Get valid access token
    access_token = SpotifyService.get_valid_access_token(current_user_id)
    
    if not access_token:
        return jsonify({'error': 'Spotify not connected'}), 401
    
    # Fetch album details
    album_data = SpotifyService.get_album_details(access_token, album_id)
    
    if not album_data:
        return jsonify({'error': 'Failed to fetch album details'}), 404
    
    # Format response
    artists = album_data.get('artists', [])
    artist_names = ', '.join([artist.get('name', '') for artist in artists])
    
    images = album_data.get('images', [])
    image_url = images[0].get('url', '') if images else None
    
    album_type = album_data.get('album_type', 'album')
    if album_type == 'single':
        item_type = 'single'
    elif album_type == 'ep':
        item_type = 'ep'
    else:
        item_type = 'album'
    
    return jsonify({
        'spotify_id': album_data.get('id'),
        'item_type': item_type,
        'item_name': album_data.get('name', ''),
        'artist_names': artist_names,
        'image_url': image_url,
        'spotify_url': album_data.get('external_urls', {}).get('spotify', ''),
        'release_date': album_data.get('release_date', ''),
        'total_tracks': album_data.get('total_tracks', 0),
        'tracks': album_data.get('tracks', {}).get('items', [])
    }), 200
