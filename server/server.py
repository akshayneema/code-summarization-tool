from flask import Flask, request, jsonify, session, make_response
from flask_cors import CORS
# from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from transformers import AutoTokenizer, AutoModelWithLMHead, SummarizationPipeline
from werkzeug.security import generate_password_hash, check_password_hash
import torch
from flask_sqlalchemy import SQLAlchemy
from functools import wraps
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
# Configure Flask-JWT-Extended
app.config['JWT_SECRET_KEY'] = 'jwt_secret_key'
jwt = JWTManager(app)
db = SQLAlchemy(app)

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

pipeline = SummarizationPipeline(
    model=AutoModelWithLMHead.from_pretrained("SEBIS/code_trans_t5_large_source_code_summarization_python_multitask_finetune"),
    tokenizer=AutoTokenizer.from_pretrained("SEBIS/code_trans_t5_large_source_code_summarization_python_multitask_finetune", skip_special_tokens=True)
)

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
    access_token = create_access_token(identity=username)
    user = User(username=username, role=role)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    resp = make_response(jsonify({'message': 'User registered successfully', 'access_token': access_token}), 201)
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
    access_token = create_access_token(identity=username)
    session['username'] = username
    session['role'] = user.role
    resp = make_response(jsonify({'message': 'Login successful', 'access_token': access_token}), 200)
    return resp

@app.route('/logout')
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/check-login')
@jwt_required()
def check_login():
    current_user = get_jwt_identity()
    return jsonify({'message': 'Logged in as: ' + current_user, 'status': 'True'}), 200

@app.route('/generate-summary', methods=['POST', 'OPTIONS'])
def generate_summary():
    if request.method == 'POST':
        data = request.json  # Get the JSON data from the request
        code_snippet = data['codeSnippet']
        print("Received data:", code_snippet)  # Print the received data to the console
        
        # Tokenize the input code snippet
        # inputs = tokenizer.encode("summarize: " + code_snippet, return_tensors="pt", max_length=1024, truncation=True)

        inputs = pythonTokenizer(code_snippet)

        # # Generate the summary using the pre-trained model
        # summary_ids = model.generate(inputs, max_length=150, min_length=40, length_penalty=2.0, num_beams=4, early_stopping=True)
        # summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)

        return pipeline([inputs])
    
    elif request.method == 'OPTIONS':
        # Respond to OPTIONS requests with CORS headers
        response = jsonify({'message': 'CORS preflight handled'})
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response

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
