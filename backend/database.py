import os
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text  # Needed for checking DB existence
from datetime import datetime, date, UTC
import uuid

# 1. Create the instance (unbound)
db = SQLAlchemy()

def init_db(app):
    """
    Configures the database, sets up pooling, and creates tables if they don't exist.
    """
    
    # --- Database Credentials ---
    user = os.getenv('DB_USER')
    password = os.getenv('DB_PASSWORD')
    host = os.getenv('DB_HOST')
    port = os.getenv('DB_PORT')
    db_name = os.getenv('DB_NAME')

    # --- Configuration ---
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"mysql+pymysql://{user}:{password}@{host}:{port}/{db_name}"
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # --- Connection Pooling ---
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_size': 10,
        'max_overflow': 20,
        'pool_timeout': 30,
        'pool_recycle': 1800,
        'pool_pre_ping': True
    }

    # 2. Bind the db to the app
    db.init_app(app)

    # 3. AUTOMATIC TABLE CREATION LOGIC
    with app.app_context():
        try:
            # Try to create all tables defined in the models below
            db.create_all()
            print(f"Database tables checked/created for: {db_name}")
        except Exception as e:
            print(f"Error creating tables. Ensure the database '{db_name}' exists in MySQL.")
            print(f"Error details: {e}")


# --- Database Models ---

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    chat_code = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    
    mood_entries = db.relationship('MoodEntry', backref='user', lazy=True)
    activity_logs = db.relationship('ActivityLog', backref='user', lazy=True)
    assessment_results = db.relationship('AssessmentResult', backref='user', lazy=True)


class MoodEntry(db.Model):
    __tablename__ = 'mood_entry'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    mood = db.Column(db.String(50), nullable=False)
    note = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.now(UTC))
    entry_date = db.Column(db.Date, default=date.today)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)


class ActivityLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    activity = db.Column(db.String(100), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.now(UTC))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)


class AssessmentResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    assessment_type = db.Column(db.String(50), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.now(UTC), nullable=False)