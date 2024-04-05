from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/generate-summary', methods=['POST', 'OPTIONS'])
def generate_summary():
    if request.method == 'POST':
        data = request.json  # Get the JSON data from the request
        codeSnippet = data['codeSnippet']
        print("Received data:", codeSnippet)  # Print the received data to the console
        # Placeholder logic to generate summary
        summary = codeSnippet[::-1]
        return jsonify({'summary': summary})  # Return the summary as JSON response
    elif request.method == 'OPTIONS':
        # Respond to OPTIONS requests with CORS headers
        response = jsonify({'message': 'CORS preflight handled'})
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response

if __name__ == '__main__':
    app.run(debug=True)  # Run the Flask app in debug mode