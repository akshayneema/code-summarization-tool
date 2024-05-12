import pytest
import sys
sys.path.append(r".\server")

from server import app, db  # Import the Flask app and database instance
from server import User, Feedback  # Import the models
from datetime import datetime

@pytest.fixture
def client():
    """Create a test client for the Flask application."""
    # Use an in-memory SQLite database for testing
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    # Disable CSRF protection for testing
    app.config['WTF_CSRF_ENABLED'] = False
    with app.app_context():  # Establish the application context
        # Initialize the Flask application with test configuration
        with app.test_client() as client:
            # Set up the database
            db.create_all()
            yield client
            # Clean up the database after testing
            db.session.remove()
            db.drop_all()

def test_health_check(client):
    """Test the health check endpoint."""
    response = client.get('/')
    assert response.status_code == 200
    assert response.data == b'OK'

def test_register_user(client):
    """Test the register endpoint."""
    data = {
        'username': 'testuser',
        'password': 'testpassword',
        'email': 'test@example.com',
        'role': 'user'
    }
    response = client.post('/register', json=data)
    assert response.status_code == 201
    assert response.json['status'] == 'True'
    assert 'access_token' in response.json
    assert 'user_id' in response.json
    assert 'role' in response.json

# Example test for the login endpoint
def test_login_user(client):
    """Test the login endpoint."""
    # First, register a test user
    client.post('/register', json={'username': 'testuser', 'password': 'testpassword', 'role': 'user'})

    # Send a POST request to log in with the registered user credentials
    response = client.post('/login', json={'username': 'testuser', 'password': 'testpassword'})
    # Check if the response is successful (status code 200)
    assert response.status_code == 200
    # Check if the response contains the expected JSON data
    assert response.json['message'] == 'Login successful'
    assert 'access_token' in response.json
    assert 'user_id' in response.json
    assert 'role' in response.json

def test_register_admin(client):
    """Test the register endpoint."""
    data = {
        'username': 'testadmin',
        'password': 'testpassword',
        'email': 'test@example.com',
        'role': 'admin'
    }
    response = client.post('/register', json=data)
    assert response.status_code == 201
    assert response.json['status'] == 'True'
    assert 'access_token' in response.json
    assert 'user_id' in response.json
    assert 'role' in response.json

# Example test for the login endpoint
def test_login_admin(client):
    """Test the login endpoint."""
    # First, register a test admin
    client.post('/register', json={'username': 'testadmin', 'password': 'testpassword', 'role': 'admin'})

    # Send a POST request to log in with the registered user credentials
    response = client.post('/login', json={'username': 'testadmin', 'password': 'testpassword'})
    # Check if the response is successful (status code 200)
    assert response.status_code == 200
    # Check if the response contains the expected JSON data
    assert response.json['message'] == 'Login successful'
    assert 'access_token' in response.json
    assert 'user_id' in response.json
    assert 'role' in response.json

def test_check_login(client):
    # First, register a test user
    client.post('/register', json={'username': 'testuser', 'password': 'testpassword', 'role': 'user'})

    # Send a POST request to log in with the registered user credentials
    response = client.post('/login', json={'username': 'testuser', 'password': 'testpassword'})
    assert response.status_code == 200
    login_data = response.get_json()
    access_token = login_data.get('access_token')

    # Send the GET request with the JWT token in the Authorization header
    response = client.get('/check-login', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'True'
    assert 'user_id' in data
    assert 'username' in data
    assert 'role' in data
    assert 'email' in data


def test_update_profile(client):
    # First, register a test user
    client.post('/register', json={'username': 'testuser', 'password': 'testpassword', 'role': 'user'})

    # Send a POST request to log in with the registered user credentials
    response = client.post('/login', json={'username': 'testuser', 'password': 'testpassword'})
    assert response.status_code == 200
    login_data = response.get_json()
    access_token = login_data.get('access_token')

    # Test updating profile with valid data
    data = {'username': 'new_username', 'email': 'new_email@example.com'}
    response = client.post('/update-profile', json=data, headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'True'
    assert data['message'] == 'Profile updated successfully'


def test_get_users(client):
    response = client.get('/get-users')
    assert response.status_code == 200
    data = response.get_json()
    assert 'users' in data
    assert isinstance(data['users'], list)
    assert len(data['users']) >= 0

def test_generate_summary(client):
    """Test the generate-summary endpoint."""
    data = {
        'codeSnippet': 'print("Hello, World!")',
        'codeLanguage': 'Python',
        'summarizationModel': 'gpt-3.5-turbo',
        'numSummaries': 1
    }
    response = client.post('/generate-summary', json=data)
    assert response.status_code == 200
    assert 'summary' in response.json

# Example test for submitting feedback
def test_submit_feedback(client):
    """Test the submit-feedback endpoint."""
    # First, create a test user in the database
    test_user = User(username='testuser', password_hash='hashedpassword', role='user')
    db.session.add(test_user)
    db.session.commit()

    # Send a POST request to submit feedback
    response = client.post('/submit-feedback', json={'user_id': test_user.id, 'language': 'Python', 'model': 'model_name', 'code': 'test code', 'summary': 'test summary', 'naturalness_rating': 5, 'usefulness_rating': 5, 'consistency_rating': 5, 'textual_feedback': 'test feedback'})

    # Check if the response is successful (status code 200)
    assert response.status_code == 200
    # Check if the feedback was successfully added to the database
    assert Feedback.query.filter_by(user_id=test_user.id).first() is not None

def test_get_feedbacks(client):
    # First, create a test user in the database
    test_user = User(username='testuser', password_hash='hashedpassword', role='user')
    db.session.add(test_user)
    db.session.commit()

    feedback = Feedback(
        user_id=test_user.id,
        language='Python',
        model='gpt-3.5-turbo',
        code='print("Hello, World!")',
        summary='Prints a greeting message',
        naturalness_rating=5,
        usefulness_rating=4,
        consistency_rating=5,
        textual_feedback='Great code!',
        created_at=datetime.utcnow()
    )
    db.session.add(feedback)
    db.session.commit()

    # Send a GET request to retrieve feedbacks
    response = client.get(f'/user/{test_user.id}/get-feedbacks')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == 1
    assert data[0]['id'] == feedback.id

def test_feedback_averages(client):
    # Send a POST request to calculate overall feedback averages
    response = client.post('/feedback-averages', json={'user_id_list':[]})
    assert response.status_code == 200
    data = response.get_json()
    assert 'avg_naturalness' in data
    assert 'avg_usefulness' in data
    assert 'avg_consistency' in data

def test_user_summaries(client):
    # First, create a user and feedback for testing
    user = User(username='testuser', password_hash='hashedpassword', role='user')
    db.session.add(user)
    db.session.commit()

    feedback = Feedback(
        user_id=user.id,
        language='Python',
        model='t5-base',
        code='print("Hello, World!")',
        summary='Prints a greeting message',
        naturalness_rating=5,
        usefulness_rating=4,
        consistency_rating=5,
        textual_feedback='Great code!',
        created_at=datetime.utcnow()
    )
    db.session.add(feedback)
    db.session.commit()

    # Send a GET request to retrieve user summaries
    response = client.get(f'/user-summaries/{user.id}')
    assert response.status_code == 200
    data = response.get_json()
    assert 'user_id' in data
    assert 'username' in data
    assert 'last_summary' in data
    assert 'best_summary' in data
    assert 'worst_summary' in data

def test_user_all_summaries(client):
    # First, create a user and feedback for testing
    user = User(username='testuser', password_hash='hashedpassword', role='user')
    db.session.add(user)
    db.session.commit()

    feedback = Feedback(
        user_id=user.id,
        language='Python',
        model='t5-base',
        code='print("Hello, World!")',
        summary='Prints a greeting message',
        naturalness_rating=5,
        usefulness_rating=4,
        consistency_rating=5,
        textual_feedback='Great code!',
        created_at=datetime.utcnow()
    )
    db.session.add(feedback)
    db.session.commit()

    # Send a GET request to retrieve all user summaries
    response = client.get(f'/user-all-summaries/{user.id}')
    assert response.status_code == 200
    data = response.get_json()
    assert 'user_id' in data
    assert 'username' in data
    assert 'summaries' in data
    assert len(data['summaries']) == 1