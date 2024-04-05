from flask import Flask, request, jsonify
from flask_cors import CORS
# from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from transformers import AutoTokenizer, AutoModelWithLMHead, SummarizationPipeline
import torch

app = Flask(__name__)
CORS(app)

# # Load the pre-trained model and tokenizer
# model_name = "t5-base"  # You can replace this with any other model from Hugging Face's model hub
# tokenizer = AutoTokenizer.from_pretrained(model_name)
# model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

pipeline = SummarizationPipeline(
    model=AutoModelWithLMHead.from_pretrained("SEBIS/code_trans_t5_large_source_code_summarization_python_multitask_finetune"),
    tokenizer=AutoTokenizer.from_pretrained("SEBIS/code_trans_t5_large_source_code_summarization_python_multitask_finetune", skip_special_tokens=True)
)

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
