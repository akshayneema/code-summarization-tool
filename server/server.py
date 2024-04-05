from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch

app = Flask(__name__)
CORS(app)

# Load the pre-trained model and tokenizer
model_name = "t5-base"  # You can replace this with any other model from Hugging Face's model hub
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

@app.route('/generate-summary', methods=['POST', 'OPTIONS'])
def generate_summary():
    if request.method == 'POST':
        data = request.json  # Get the JSON data from the request
        code_snippet = data['codeSnippet']
        print("Received data:", code_snippet)  # Print the received data to the console
        
        # Tokenize the input code snippet
        inputs = tokenizer.encode("summarize: " + code_snippet, return_tensors="pt", max_length=1024, truncation=True)

        # Generate the summary using the pre-trained model
        summary_ids = model.generate(inputs, max_length=150, min_length=40, length_penalty=2.0, num_beams=4, early_stopping=True)
        summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)

        return jsonify({'summary': summary})  # Return the summary as JSON response
    elif request.method == 'OPTIONS':
        # Respond to OPTIONS requests with CORS headers
        response = jsonify({'message': 'CORS preflight handled'})
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response

if __name__ == '__main__':
    app.run(debug=True)  # Run the Flask app in debug mode
