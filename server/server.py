from flask import Flask, request, jsonify, session, make_response
from flask_cors import CORS
# from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from transformers import AutoTokenizer, AutoModelWithLMHead, SummarizationPipeline
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from functools import wraps
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import requests
from openai import OpenAI
from datetime import datetime
from sqlalchemy import func

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow requests from all origins for all routes
app.config['SECRET_KEY'] = 'your_secret_key'
# Change the database URI to use a file-based SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Disable modification tracking to suppress warnings
# Configure Flask-JWT-Extended
app.config['JWT_SECRET_KEY'] = 'jwt_secret_key'
jwt = JWTManager(app)
db = SQLAlchemy(app)
migrate = Migrate(app, db)

client = OpenAI()

# Define User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
# Define Feedback model
class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    language = db.Column(db.String(50), nullable=False)  # Add language column
    model = db.Column(db.String(50), nullable=False)  # Add model column
    code = db.Column(db.Text, nullable=False)  # Add code column
    summary = db.Column(db.Text, nullable=False)  # Add summary column
    naturalness_rating = db.Column(db.Integer, nullable=False)
    usefulness_rating = db.Column(db.Integer, nullable=False)
    consistency_rating = db.Column(db.Integer, nullable=False)
    textual_feedback = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Define a relationship with the User model
    user = db.relationship('User', backref=db.backref('feedbacks', lazy=True))
    
def create_admin_user():
    # Check if the admin user already exists
    admin_user = User.query.filter_by(username='admin').first()
    if not admin_user:
        # Create the admin user with default username and password
        admin = User(username='username', role='admin')
        admin.set_password('admin')  # Set default password
        db.session.add(admin)
        db.session.commit()
        print("Admin user created successfully")

# Use app.app_context() to ensure the code is executed within the application context
with app.app_context():
    # Create database tables
    db.create_all()
    # Create the admin user
    create_admin_user()

# Admin decorator to restrict access to administrators only
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get('role') != 'admin':
            return jsonify({'message': 'Unauthorized access'}), 403
        return f(*args, **kwargs)
    return decorated_function

# # Load the pre-trained model and tokenizer
# model_name = "t5-base"  # You can replace this with any other model from Hugging Face's model hub
# tokenizer = AutoTokenizer.from_pretrained(model_name)
# model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

# pipeline = SummarizationPipeline(
#     model=AutoModelWithLMHead.from_pretrained("SEBIS/code_trans_t5_large_source_code_summarization_python_multitask_finetune"),
#     tokenizer=AutoTokenizer.from_pretrained("SEBIS/code_trans_t5_large_source_code_summarization_python_multitask_finetune", skip_special_tokens=True)
# )

@app.route('/', methods=['GET'])
def health_check():
    return 'OK'

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')

    if not username or not password or not role:
        return jsonify({'message': 'Missing username, password, or role'}), 400

    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({'message': 'Username already exists'}), 409

    # Generate JWT token
    user = User(username=username, role=role)
    user.set_password(password)
    access_token = create_access_token(identity=user.id)
    db.session.add(user)
    db.session.commit()
    resp = make_response(jsonify({'message': 'User registered successfully', 'access_token': access_token, 'user_id': user.id, 'role': user.role}), 201)
    return resp

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Missing username or password'}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid username or password'}), 401

    # Generate JWT token
    access_token = create_access_token(identity=user.id)
    session['user_id'] = user.id
    session['username'] = username
    session['role'] = user.role
    resp = make_response(jsonify({'message': 'Login successful', 'access_token': access_token, 'user_id': user.id, 'role': user.role}), 200)
    return resp

@app.route('/logout')
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/check-login')
@jwt_required()
def check_login():
    current_user = get_jwt_identity()
    # print("current user - ", current_user)
    return jsonify({'message': 'Logged in as user id: ' + str(current_user), 'status': 'True', 'user_id': current_user}), 200

@app.route('/generate-summary', methods=['POST', 'OPTIONS'])
def generate_summary():
    if request.method == 'POST':
        data = request.json  # Get the JSON data from the request
        code_snippet = data.get('codeSnippet')  # Retrieve the code snippet from the JSON data
        code_language = data.get('codeLanguage')
        summ_model = data.get('summarizationModel')
        num_summ = data.get('numSummaries')

        try:
            completion = client.chat.completions.create(
                model=summ_model,
                messages=[
                    {"role": "system", "content": "You are a code summarization assistant that generates concise yet informative natural language summaries to the code provided to you to best of your efforts."},
                    {"role": "user", "content": f"Create natural language summary for the {code_language} code provided - {code_snippet}"}
                ],
                n=num_summ
            )

            return jsonify({"summary": [gen.message.content for gen in completion.choices], "status": 200})
        except Exception as e:
            # Handle the error
            error_message = f"An error occurred while generating summary: {str(e)}"
            print(error_message)
            return jsonify({"error": error_message, "status": 500})
        
        # # Define the API endpoint URL
        # url = 'http://localhost:11434/api/generate'

        # # Define the request payload (JSON data)
        # payload = {
        #     "model": "codellama:7b",
        #     "prompt": "Please geneate natural language summary for the code - " + code_snippet,
        #     "format": "json",
        #     "stream": False
        # }

        # # Make the POST request
        # response = requests.post(url, json=payload)

        # # Check if the request was successful (status code 200)
        # if response.status_code == 200:
        #     # Extract the JSON response
        #     json_data = response.json()
        #     # Process the JSON data as needed
        #     return json_data['response']
        # else:
        #     # Print the error message if the request failed
        #     return f"Error: {response.status_code} - {response.text}", 500
    
    elif request.method == 'OPTIONS':
        # Respond to OPTIONS requests with CORS headers
        response = jsonify({'message': 'CORS preflight handled'})
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
    
# Route for submitting feedback
@app.route('/submit-feedback', methods=['POST', 'OPTIONS'])
def submit_feedback():
    if request.method == 'OPTIONS':
        # Handle preflight request (CORS)
        response = make_response()
        response.headers['Access-Control-Allow-Methods'] = 'POST'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response

    # For POST requests, handle feedback submission as before
    # Get feedback data from the request JSON
    feedback_data = request.json

    # Extract data from the JSON
    user_id = feedback_data.get('user_id')
    language = feedback_data.get('language')
    model = feedback_data.get('model')
    code = feedback_data.get('code')
    summary = feedback_data.get('summary')
    naturalness_rating = feedback_data.get('naturalness_rating')
    usefulness_rating = feedback_data.get('usefulness_rating')
    consistency_rating = feedback_data.get('consistency_rating')
    textual_feedback = feedback_data.get('textual_feedback')

    # Create a new Feedback object
    feedback = Feedback(
        user_id=user_id,
        language=language,
        model=model,
        code=code,
        summary=summary,
        naturalness_rating=naturalness_rating,
        usefulness_rating=usefulness_rating,
        consistency_rating=consistency_rating,
        textual_feedback=textual_feedback
    )

    # Add the feedback object to the database session
    db.session.add(feedback)

    try:
        # Commit the session to save the feedback to the database
        db.session.commit()
        return jsonify({'message': 'Feedback submitted successfully'}), 200
    except Exception as e:
        # Rollback the session if an error occurs
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    

@app.route('/average-ratings', methods=['GET'])
@app.route('/average-ratings/<int:user_id>', methods=['GET'])
def average_ratings(user_id=None):
    # Check if user_id is provided
    print(user_id)
    if user_id:
        # Query the database to calculate average ratings for the selected user
        user_feedback_ratings = db.session.query(
            User.id,
            User.username,
            func.avg(Feedback.naturalness_rating).label('avg_naturalness'),
            func.avg(Feedback.usefulness_rating).label('avg_usefulness'),
            func.avg(Feedback.consistency_rating).label('avg_consistency')
        ).join(Feedback, User.id == Feedback.user_id).filter(User.id == user_id).group_by(User.id).first()

        if not user_feedback_ratings:
            return jsonify({'message': 'User feedback not found'}), 404

        # Prepare the response data
        ratings_data = {
            'user_id': user_feedback_ratings[0],
            'username': user_feedback_ratings[1],
            'avg_naturalness': user_feedback_ratings[2],
            'avg_usefulness': user_feedback_ratings[3],
            'avg_consistency': user_feedback_ratings[4]
        }

        # Return the ratings data for the selected user as JSON
        return jsonify(ratings_data)
    else:
        # Query the database to calculate average ratings across all users
        average_ratings = db.session.query(
            func.avg(Feedback.naturalness_rating).label('avg_naturalness'),
            func.avg(Feedback.usefulness_rating).label('avg_usefulness'),
            func.avg(Feedback.consistency_rating).label('avg_consistency')
        ).first()

        # Prepare the response data
        ratings_data = {
            'avg_naturalness': average_ratings[0],
            'avg_usefulness': average_ratings[1],
            'avg_consistency': average_ratings[2]
        }

        # Return the ratings data for all users as JSON
        return jsonify(ratings_data)

# Your existing code...

if __name__ == '__main__':
    app.run(debug=True)



import tokenize
import io

def pythonTokenizer(line):
    result= []
    line = io.StringIO(line) 
    
    for toktype, tok, start, end, line in tokenize.generate_tokens(line.readline):
        if (not toktype == tokenize.COMMENT):
            if toktype == tokenize.STRING:
                result.append("CODE_STRING")
            elif toktype == tokenize.NUMBER:
                result.append("CODE_INTEGER")
            elif (not tok=="\n") and (not tok=="    "):
                result.append(str(tok))
    return ' '.join(result)

if __name__ == '__main__':
    app.run(debug=True)  # Run the Flask app in debug mode
