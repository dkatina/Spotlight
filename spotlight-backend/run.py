from app import create_app
from app import db
import os

app = create_app(os.getenv('FLASK_ENV', 'development'))

with app.app_context():
    # db.drop_all()
    db.create_all()

if __name__ == '__main__':  
    app.run(debug=True, host='0.0.0.0', port=5000)

