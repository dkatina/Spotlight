"""
Script to add is_admin column to users table and set a user as admin
Usage: python add_admin_column_and_set_admin.py <email>
"""
import sys
import os
from app import create_app, db
from app.models import User
from sqlalchemy import text

def add_column_and_set_admin(email):
    """Add is_admin column if it doesn't exist and set a user as admin"""
    app = create_app(os.getenv('FLASK_ENV', 'development'))
    
    with app.app_context():
        # Check if column exists and add it if it doesn't
        inspector = db.inspect(db.engine)
        columns = [col['name'] for col in inspector.get_columns('users')]
        
        if 'is_admin' not in columns:
            print("Adding is_admin column to users table...")
            try:
                # For SQLite
                with db.engine.connect() as conn:
                    conn.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT 0"))
                    conn.commit()
                print("Successfully added is_admin column.")
            except Exception as e:
                print(f"Error adding column (it may already exist): {e}")
                # Try to continue anyway
        
        # Now set the user as admin
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
        print("Usage: python add_admin_column_and_set_admin.py <email>")
        sys.exit(1)
    
    email = sys.argv[1]
    success = add_column_and_set_admin(email)
    sys.exit(0 if success else 1)

