from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate
from config import config

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()
cors = CORS()

def create_app(config_name='default'):
    """Application factory function"""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, origins=app.config['CORS_ORIGINS'], supports_credentials=True)
    
    # Initialize Swagger
    from flasgger import Swagger
    
    swagger_config = {
        "headers": [],
        "specs": [
            {
                "endpoint": "apispec",
                "route": "/apispec.json",
                "rule_filter": lambda rule: True,
                "model_filter": lambda tag: True,
            }
        ],
        "static_url_path": "/flasgger_static",
        "swagger_ui": True,
        "specs_route": "/api/docs"
    }
    
    swagger_template = {
        "swagger": "2.0",
        "info": {
            "title": "Spotlight Music Hub API",
            "description": "API documentation for Spotlight - A music link hub platform for artists",
            "version": "1.0.0",
            "contact": {
                "name": "Spotlight API Support"
            }
        },
        "basePath": "/api",
        "schemes": ["http", "https"],
        "securityDefinitions": {
            "Bearer": {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header",
                "description": "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\""
            }
        },
        "tags": [
            {
                "name": "Authentication",
                "description": "User authentication and authorization endpoints"
            },
            {
                "name": "Spotify",
                "description": "Spotify OAuth integration and music data endpoints"
            },
            {
                "name": "Profiles",
                "description": "User profile management endpoints"
            },
            {
                "name": "Social Links",
                "description": "Social media links management endpoints"
            },
            {
                "name": "Music Showcase",
                "description": "Music showcase management endpoints"
            },
            {
                "name": "Health",
                "description": "API health check endpoints"
            }
        ]
    }
    
    Swagger(app, config=swagger_config, template=swagger_template)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.spotify import spotify_bp
    from app.routes.profiles import profiles_bp
    from app.routes.social_links import social_links_bp
    from app.routes.music_showcase import music_showcase_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(spotify_bp, url_prefix='/api/spotify')
    app.register_blueprint(profiles_bp, url_prefix='/api/profiles')
    app.register_blueprint(social_links_bp, url_prefix='/api/social-links')
    app.register_blueprint(music_showcase_bp, url_prefix='/api/music-showcase')
    
    # Serve uploaded avatar files
    @app.route('/api/uploads/avatars/<filename>', methods=['GET'])
    def serve_avatar(filename):
        """Serve uploaded avatar files"""
        from flask import send_from_directory
        upload_folder = app.config['UPLOAD_FOLDER']
        return send_from_directory(upload_folder, filename)
    
    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        """
        Health Check
        Check if the API is running
        ---
        tags:
          - Health
        responses:
          200:
            description: API is healthy
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: healthy
        """
        return {'status': 'healthy'}, 200
    
    return app

