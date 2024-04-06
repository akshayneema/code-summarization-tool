# Code Summarization Tool

## Overview
The Code Summarization Tool is a web application that allows users to input code snippets and generate summaries for them. It provides a convenient way to obtain concise descriptions of code functionality, making it easier for developers to understand and work with complex codebases.

## Features
- Input area for code snippets
- Generate summary functionality
- Rate generated summaries for naturalness, usefulness, and consistency
- Submit ratings for generated summaries
- User-friendly interface

## Technologies Used
- **Frontend**: React.js
- **Backend**: Python with Flask

## Setup Instructions
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd code-summarization-tool

2. **Install frontend dependencies**
   ```bash
   npm install

3. **Create and activate a conda environment:**
   ```bash
   conda create --name cs520 python=3.9
   conda activate cs520

4. **Install server dependencies:**
   ```bash
   pip install -r requirements.txt

## Activate App and Server (Use separate command lines)

1. **Activate Python Server:**
   ```bash
   conda activate cs520
   python server/server.py

2. **Start React App:**
   ```bash
   npm start

## Open the web app in your browser:
- React app: [http://localhost:3000](http://localhost:3000)
- Python server: [http://localhost:5000](http://localhost:5000)

## API Endpoints

### POST /generate-summary
Generates a summary for the provided code snippet.

- **Request body:**
  ```json
  {
    "codeSnippet": "Your code snippet here"
  }

- - **Response:**
  ```json
  {
    "summary": "Generated summary text"
  }
