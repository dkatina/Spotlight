"""
Script to set a user as admin
Usage: python set_admin.py <email>
"""
import sys
import os
from app import create_app, db
from app.models import User

def set_admin(email):
    """Set a user as admin by email"""
    app = create_app(os.getenv('FLASK_ENV', 'development'))
    
    with app.app_context():
        user = User.query.filter_by(email=email.lower().strip()).first()
        
        if not user:
            print(f"Error: User with email '{email}' not found.")
            return False
        
        if user.is_admin:
            print(f"User '{email}' is already an admin.")
            return True
        
        user.is_admin = True
        try:
            db.session.commit()
            print(f"Successfully set '{email}' as admin.")
            return True
        except Exception as e:
            db.session.rollback()
            print(f"Error setting admin status: {e}")
            return False

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python set_admin.py <email>")
        sys.exit(1)
    
    email = sys.argv[1]
    success = set_admin(email)
    sys.exit(0 if success else 1)

