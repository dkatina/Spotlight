from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app import db
from app.models import User, UserProfile
from app.utils import validate_email, validate_username, validate_password

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    User Registration
    Register a new user account
    ---
    tags:
      - Authentication
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - email
            - username
            - password
          properties:
            email:
              type: string
              format: email
              example: artist@example.com
            username:
              type: string
              minLength: 3
              maxLength: 50
              pattern: '^[a-zA-Z0-9_]+$'
              example: artist123
            password:
              type: string
              minLength: 8
              example: securepassword123
    responses:
      201:
        description: User registered successfully
        schema:
          type: object
          properties:
            message:
              type: string
              example: User registered successfully
            access_token:
              type: string
              example: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
            refresh_token:
              type: string
              example: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
            user:
              type: object
              properties:
                id:
                  type: integer
                email:
                  type: string
                username:
                  type: string
                created_at:
                  type: string
      400:
        description: Invalid input data
      409:
        description: Email or username already exists
      500:
        description: Registration failed
    """
    data = request.get_json()
    
    # Validate input
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    email = data.get('email', '').strip().lower()
    username = data.get('username', '').strip()
    password = data.get('password', '')
    
    # Validation
    if not email or not validate_email(email):
        return jsonify({'error': 'Invalid email address'}), 400
    
    if not username or not validate_username(username):
        return jsonify({'error': 'Invalid username. Must be 3-50 characters, alphanumeric and underscores only'}), 400
    
    if not password or not validate_password(password):
        return jsonify({'error': 'Password must be at least 8 characters'}), 400
    
    # Check if user exists
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already taken'}), 409
    
    # Create user
    user = User(email=email, username=username)
    user.set_password(password)
    
    try:
        db.session.add(user)
        db.session.commit()
        
        # Create default profile
        profile = UserProfile(user_id=user.id, display_name=username)
        db.session.add(profile)
        db.session.commit()
        
        # Generate tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    User Login
    Authenticate user and receive JWT tokens
    ---
    tags:
      - Authentication
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - email
            - password
          properties:
            email:
              type: string
              format: email
              example: artist@example.com
            password:
              type: string
              example: securepassword123
    responses:
      200:
        description: Login successful
        schema:
          type: object
          properties:
            message:
              type: string
              example: Login successful
            access_token:
              type: string
              example: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
            refresh_token:
              type: string
              example: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
            user:
              type: object
              properties:
                id:
                  type: integer
                email:
                  type: string
                username:
                  type: string
      400:
        description: Invalid input
      401:
        description: Invalid credentials
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    
    # Find user
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Generate tokens
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    Refresh Access Token
    Get a new access token using refresh token
    ---
    tags:
      - Authentication
    security:
      - Bearer: []
    responses:
      200:
        description: Token refreshed successfully
        schema:
          type: object
          properties:
            access_token:
              type: string
              example: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
      401:
        description: Invalid or expired refresh token
    """
    current_user_id = get_jwt_identity()
    new_token = create_access_token(identity=current_user_id)
    
    return jsonify({
        'access_token': new_token
    }), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """
    Get Current User Profile
    Retrieve authenticated user's profile information
    ---
    tags:
      - Authentication
    security:
      - Bearer: []
    responses:
      200:
        description: User profile retrieved successfully
        schema:
          type: object
          properties:
            id:
              type: integer
            email:
              type: string
            username:
              type: string
            created_at:
              type: string
            profile:
              type: object
              properties:
                id:
                  type: integer
                display_name:
                  type: string
                bio:
                  type: string
                avatar_url:
                  type: string
                theme_settings:
                  type: object
                is_public:
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
    
    response_data = user.to_dict()
    
    # Include profile data if exists
    if user.profile:
        response_data['profile'] = user.profile.to_dict()
    
    return jsonify(response_data), 200
