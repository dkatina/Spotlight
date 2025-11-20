"""
Script to add profile_clicks table to database
"""
import sys
import os
from app import create_app, db
from app.models import ProfileClick

def add_profile_clicks_table():
    """Create profile_clicks table if it doesn't exist"""
    app = create_app(os.getenv('FLASK_ENV', 'development'))
    
    with app.app_context():
        try:
            # Create the table
            db.create_all()
            print("Successfully created profile_clicks table (or it already exists).")
            return True
        except Exception as e:
            print(f"Error creating table: {e}")
            return False

if __name__ == '__main__':
    success = add_profile_clicks_table()
    sys.exit(0 if success else 1)

