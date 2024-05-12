import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Editor } from '@monaco-editor/react'; 
import { Select, MenuItem } from '@material-ui/core';
import './GenerateSummary.css'; // Import CSS file for component styling
import { useCookies } from 'react-cookie';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

const GenerateSummary = ({userId}) => {
  // State to store code snippet input
  const [codeSnippet, setCodeSnippet] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileExtension, setSelectedFileExtension] = useState('');
  const [fileInputKey, setFileInputKey] = useState(0); // Key to reset the file input element
  // State to store the random fact
  const [randomFact, setRandomFact] = useState(null);
  // State to store generated summary
  const [summary, setSummary] = useState([]);
  // States to store ratings for each perspective
  const [naturalnessRating, setNaturalnessRating] = useState(3); // Default: Average
  const [usefulnessRating, setUsefulnessRating] = useState(3); // Default: Average
  const [consistencyRating, setConsistencyRating] = useState(3); // Default: Average
  const [textualFeedback, setTextualFeedback] = useState('');
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);


  // State to track whether a summary is generated
  const [isRatingSectionOpen, setIsRatingSectionOpen] = useState(false);

  const [isSummaryGenerating, setIsSummaryGenerating] = useState(false);
  const [isBlip, setIsBlip] = useState(false); // State to trigger blip animation

  const [generationTime, setGenerationTime] = useState(null);

  const [selectedLanguage, setSelectedLanguage] = useState('Python'); // Default language is Python
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo'); // Default language is Python
  const [numSummaries, setNumSummaries] = useState(1); // Default: 1
  const [selectedSummaryIndex, setSelectedSummaryIndex] = useState(0);

  const [theme, setTheme] = useState('light'); // Default theme is light
  const [cookies, setCookie] = useCookies(['jwtToken']);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Effect to trigger blip animation when isSummaryGenerating is true
  useEffect(() => {
    if (isSummaryGenerating) {
      setIsBlip(true); // Enable blip animation
    } else {
      // Disable blip animation after summary generation is complete
      setIsBlip(false);
    }
  }, [isSummaryGenerating]);

  useEffect(() => {
      // Reset isFeedbackSubmitted when a new summary is generated or a different summary is selected
      setIsFeedbackSubmitted(false);
  }, [selectedSummaryIndex, summary]);


  // Function to handle code snippet input change
  const handleCodeChange = (value) => {
    setCodeSnippet(value);
  };

  // Function to handle "Generate Summary" button click
  const generateSummary = async () => {
    const startTime = Date.now();
    setIsSummaryGenerating(true); // Set loading state to true
    setIsRatingSectionOpen(false);
      try {
        const response = await axios.post('http://127.0.0.1:5000/generate-summary', {
          codeLanguage: selectedLanguage,
          codeSnippet: codeSnippet,
          summarizationModel: selectedModel,
          numSummaries: numSummaries
        });
    
        if (response.data.status == 200) {
          const summary = response.data.summary;
          setSummary(summary);
          setNaturalnessRating(3); // Average
          setUsefulnessRating(3); // Average
          setConsistencyRating(3); // Average
          setIsRatingSectionOpen(true);
          setSelectedSummaryIndex(0); // Reset selected summary index to 0
        } else {
          throw new Error('Failed to generate summary. Status: ' + response.status + ', Error: ' + response.error);
        }
      } catch (error) {
        console.error('Error generating summary:', error);
      } finally {
        const endTime = Date.now();
        setIsSummaryGenerating(false);
        setSummaryGenerationTime(startTime, endTime);
      }
    };  

  const setSummaryGenerationTime = (startTime, endTime) => {
    const timeTaken = (endTime - startTime) / 1000; // Convert milliseconds to seconds
    setGenerationTime(timeTaken.toFixed(2)); // Round to 2 decimal places
  };

  // Function to fetch a random fact from the server
  const fetchRandomFact = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/generate-random-fact');
      if (response.data.status === 200) {
        console.log('Random fact:', response.data.fact);
        setRandomFact(response.data.fact); // Set the random fact in state
      } else {
        throw new Error('Failed to fetch random fact');
      }
    } catch (error) {
      console.error('Error fetching random fact:', error);
    }
  };

  useEffect(() => {
    fetchRandomFact();
  }, []);

  // Function to handle "Submit Rating" button click
  const submitRating = async () => {
    console.log('Naturalness Rating:', naturalnessRating);
    console.log('Usefulness Rating:', usefulnessRating);
    console.log('Consistency Rating:', consistencyRating);
    console.log('Textual Feedback:', textualFeedback);

    try {
      const selectedSummary = summary[selectedSummaryIndex]; // Extract the selected summary
      const response = await axios.post('http://127.0.0.1:5000/submit-feedback', {
        user_id: userId,
        language: selectedLanguage,
        model: selectedModel,
        code: codeSnippet,
        summary: selectedSummary, // Pass only the selected summary
        naturalness_rating: naturalnessRating,
        usefulness_rating: usefulnessRating,
        consistency_rating: consistencyRating,
        textual_feedback: textualFeedback // Include textual feedback
      });

      // Check if the request was successful
      if (response.status === 200) {
        // Set feedback submission success message
        setFeedbackMessage('Feedback submitted successfully !');
      } else {
        // Set feedback submission error message if the request was not successful
        setFeedbackMessage('Error submitting feedback');
      }
      setTimeout(() => {
        setFeedbackMessage(null);
      }, 3000);

      setIsFeedbackSubmitted(true);
      // Reset ratings to default values
      setNaturalnessRating(3);
      setUsefulnessRating(3);
      setConsistencyRating(3);
      setTextualFeedback('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // Set feedback submission error message
      setFeedbackMessage('Error submitting feedback');
      setTimeout(() => {
        setFeedbackMessage(null);
      }, 2000);
    }

    // setIsRatingSectionOpen(false);
  };

  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
  };

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileName = file.name;
      const fileExtension = fileName.split('.').pop(); // Extract the extension
      setSelectedFileName(fileName); // Set the name of the selected file
      setSelectedFileExtension(fileExtension); // Set the detected file extension
  
      // Map file extensions to corresponding languages
      const extensionToLanguageMap = {
        py: 'Python',
        js: 'JavaScript',
        java: 'Java',
        cpp: 'C++',
        c: 'C',
        cs: 'C#',
        rb: 'Ruby',
        php: 'PHP',
        swift: 'Swift',
        kt: 'Kotlin',
        ts: 'TypeScript',
        html: 'HTML',
        css: 'CSS',
        go: 'Go',
        rs: 'Rust',
        scala: 'Scala',
        r: 'R',
        m: 'MATLAB',
        sh: 'Shell Script',
        // Add more mappings as needed
      };
  
      let language = extensionToLanguageMap[fileExtension.toLowerCase()]; // Get the corresponding language
      if (!language) {
        language = 'Other'; // Set to 'Other' if no matching language found
      }
      setSelectedLanguage(language); // Set the selected language
  
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target.result;
        setCodeSnippet(content); // Populate code editor with file content
      };
      reader.readAsText(file);
      setFileInputKey((prevKey) => prevKey + 1);
    }
  };

  // Function to handle number of summaries change
  const handleNumSummariesChange = (event) => {
    setNumSummaries(event.target.value);
  };

  // Function to handle selection of a different summary
  const handleSelectedSummaryChange = (event) => {
    setSelectedSummaryIndex(event.target.value);
    setNaturalnessRating(3);
    setUsefulnessRating(3);
    setConsistencyRating(3);
    setTextualFeedback('');
  };

  // Function to handle textual feedback input change
  const handleTextualFeedbackChange = (event) => {
    setTextualFeedback(event.target.value);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`container ${theme === 'light' ? 'light-theme' : 'dark-theme'}`}>
      <div className="left-panel">
        <h1 className="title">Input Code</h1>
        {/* <div className={`theme-toggle ${theme === 'light' ? 'theme-toggle-light' : 'theme-toggle-dark'}`} onClick={toggleTheme}>
          {theme === 'light' ? '🌞' : '🌙'}
        </div> */}
        {/* Input area for code snippet */}
        <div className="language-dropdown">
          <label>Select Language: </label>
          <Select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            renderValue={(value) => (
              <span style={{ color: theme === 'dark' ? '#f8f8f8' : '#333' }}>{selectedLanguage}</span>
            )}
          >
            <MenuItem value="Python">Python</MenuItem>
            <MenuItem value="JavaScript">JavaScript</MenuItem>
            <MenuItem value="Java">Java</MenuItem>
            <MenuItem value="C">C</MenuItem>
            <MenuItem value="C++">C++</MenuItem>
            <MenuItem value="C#">C#</MenuItem>
            <MenuItem value="Ruby">Ruby</MenuItem>
            <MenuItem value="PHP">PHP</MenuItem>
            <MenuItem value="Swift">Swift</MenuItem>
            <MenuItem value="Kotlin">Kotlin</MenuItem>
            <MenuItem value="TypeScript">TypeScript</MenuItem>
            <MenuItem value="HTML">HTML</MenuItem>
            <MenuItem value="CSS">CSS</MenuItem>
            <MenuItem value="Go">Go</MenuItem>
            <MenuItem value="Rust">Rust</MenuItem>
            <MenuItem value="Scala">Scala</MenuItem>
            <MenuItem value="R">R</MenuItem>
            <MenuItem value="MATLAB">MATLAB</MenuItem>
            <MenuItem value="Shell Script">Shell Script</MenuItem>
            <MenuItem value="">Other</MenuItem>
          </Select>
        </div>
        <div className="model-dropdown">
          <label>Select Model: </label>
          <Select
            value={selectedModel}
            onChange={handleModelChange}
            renderValue={(value) => (
              <span style={{ color: theme === 'dark' ? '#f8f8f8' : '#333' }}>{selectedModel}</span>
            )}
          >
            <MenuItem value="gpt-3.5-turbo">gpt-3.5-turbo</MenuItem>
            <MenuItem value="gpt-4">gpt-4</MenuItem>
            <MenuItem value="gpt-4-turbo">gpt-4-turbo</MenuItem>
          </Select>
        </div>
        <div className="num-summaries-dropdown">
          <label>Select Number of Summaries: </label>
          <Select
            value={numSummaries}
            onChange={handleNumSummariesChange}
            renderValue={(value) => (
              <span style={{ color: theme === 'dark' ? '#f8f8f8' : '#333' }}>{value}</span>
            )}
          >
            {[...Array(10)].map((_, index) => (
              <MenuItem key={index + 1} value={index + 1}>{index + 1}</MenuItem>
            ))}
          </Select>
        </div>
        <Editor
          language={selectedLanguage.toLowerCase()}
          value={codeSnippet}
          onChange={handleCodeChange}
          options={{
            minimap: {
              enabled: false
            }
          }}
          height="600px"
          disabled={isSummaryGenerating}
        />
        <div className="file-upload-container">
          <label className="file-upload-label">
            {/* <CloudUploadIcon className="file-upload-icon" />  */}
            <span className="file-upload-button">Choose File</span>
            <input
              key={fileInputKey}
              type="file"
              accept=".py,.js,.java,.cpp,.c,.cs,.rb,.php,.swift,.kt,.ts,.html,.css,.go,.rs,.scala,.r,.m,.sh" 
              onChange={(event) => { // Clear the file input field after selection
                handleFileUpload(event); // Call handleFileUpload manually
              }}
              className="file-upload-input"
              style={{ display: 'none' }} // Hide the default file input
            />
          </label>
          <span className="file-upload-info">
            {selectedFileName ? 'File Selected: ' + selectedFileName : 'No file selected'}
          </span>
        </div>
        <br />
        {/* "Generate Summary" button */}
        <button className={`generate-btn ${isSummaryGenerating ? 'disabled' : ''}`} onClick={generateSummary} disabled={isSummaryGenerating}>Generate Summary</button>
      </div>
      {/* <hr /> */}
      {/* Display area for generated summary */}
      <div className="right-panel">
        <h1 className="title">Generated Summary</h1>
        <div className={`summary-container ${isBlip ? 'blip' : ''}`}>
        {isSummaryGenerating ? (
      <p className="loading-message">Hold on a sec while I get your summary...</p>
    ) : (
      <>
        {summary.length > 0 ? (
          <>
            <div className="summary-dropdown">
              <label>Select Summary: </label>
              <Select
                value={selectedSummaryIndex}
                onChange={handleSelectedSummaryChange}
                renderValue={(value) => (
                  <span style={{ color: theme === 'dark' ? '#f8f8f8' : '#333' }}>Summary {value+1}</span>
                )}
              >
                {summary.map((_, index) => (
                  <MenuItem key={index} value={index}>{`Summary ${index + 1}`}</MenuItem>
                ))}
              </Select>
            </div>
            <p className="summary">{summary[selectedSummaryIndex]}</p>
            <div className="generation-time">
              {generationTime !== null && (
                <p>Summary generated in {generationTime} seconds.</p>
              )}
            </div>
          </>
        ) : (
          <>
            {randomFact ? (
              <div className="no-summary-placeholder">
                <p className="no-summary-message">Oops! Looks like there's no summary available.</p>
                <p className="random-fact-message">By the time you generate a summary, enjoy this interesting fact - </p>
                <p className="random-fact">{randomFact}</p>
              </div>
            ) : (
              <div className="no-summary-placeholder">
                {/* <img src="robot-no-summary.png" alt="No summary available" className="robot-image" /> */}
                <p className="no-summary-message">Oops! Looks like there's no summary available.</p>
                <p className="no-summary-tip">Try generating one by inputting your code snippet and clicking "Generate Summary"!</p>
              </div>
            )}
            </>
        )}
      </>
    )}
        </div>

        <div>
          {/* Feedback submission message */}
          {feedbackMessage && <p style={{ fontWeight: 'bold' }}>{feedbackMessage}</p>}
      </div>

        {/* Rating section */}
        <div className={`rating-container ${theme === 'dark' ? 'dark-mode' : ''} ${isRatingSectionOpen && summary && !isSummaryGenerating ? '' : 'hidden'}`}>
          <h2 className="rating-title">Rate the Summary:</h2>
          <div className="rating-perspective">
            <label className="rating-label">Naturalness:</label>
            <div className="rating-options">
              <input type="radio" id="naturalness-excellent" name="naturalness" value="5" checked={naturalnessRating === 5} onChange={() => setNaturalnessRating(5)} />
              <label htmlFor="naturalness-excellent">Excellent</label>
              <input type="radio" id="naturalness-good" name="naturalness" value="4" checked={naturalnessRating === 4} onChange={() => setNaturalnessRating(4)} />
              <label htmlFor="naturalness-good" className={theme === 'dark' ? 'dark-mode-label' : ''}>Good</label>
              <input type="radio" id="naturalness-average" name="naturalness" value="3" checked={naturalnessRating === 3} onChange={() => setNaturalnessRating(3)} />
              <label htmlFor="naturalness-average" className={theme === 'dark' ? 'dark-mode-label' : ''}>Average</label>
              <input type="radio" id="naturalness-bad" name="naturalness" value="2" checked={naturalnessRating === 2} onChange={() => setNaturalnessRating(2)} />
              <label htmlFor="naturalness-bad" className={theme === 'dark' ? 'dark-mode-label' : ''}>Bad</label>
              <input type="radio" id="naturalness-poor" name="naturalness" value="1" checked={naturalnessRating === 1} onChange={() => setNaturalnessRating(1)} />
              <label htmlFor="naturalness-poor" className={theme === 'dark' ? 'dark-mode-label' : ''}>Poor</label>
            </div>
          </div>
          {/* Repeat the same process for the other perspectives */}
          {/* Usefulness */}
          <div className="rating-perspective">
            <label className="rating-label">Usefulness:</label>
            <div className="rating-options">
              <input type="radio" id="usefulness-excellent" name="usefulness" value="5" checked={usefulnessRating === 5} onChange={() => setUsefulnessRating(5)} />
              <label htmlFor="usefulness-excellent" className={theme === 'dark' ? 'dark-mode-label' : ''}>Excellent</label>
              <input type="radio" id="usefulness-good" name="usefulness" value="4" checked={usefulnessRating === 4} onChange={() => setUsefulnessRating(4)} />
              <label htmlFor="usefulness-good" className={theme === 'dark' ? 'dark-mode-label' : ''}>Good</label>
              <input type="radio" id="usefulness-average" name="usefulness" value="3" checked={usefulnessRating === 3} onChange={() => setUsefulnessRating(3)} />
              <label htmlFor="usefulness-average" className={theme === 'dark' ? 'dark-mode-label' : ''}>Average</label>
              <input type="radio" id="usefulness-bad" name="usefulness" value="2" checked={usefulnessRating === 2} onChange={() => setUsefulnessRating(2)} />
              <label htmlFor="usefulness-bad" className={theme === 'dark' ? 'dark-mode-label' : ''}>Bad</label>
              <input type="radio" id="usefulness-poor" name="usefulness" value="1" checked={usefulnessRating === 1} onChange={() => setUsefulnessRating(1)} />
              <label htmlFor="usefulness-poor" className={theme === 'dark' ? 'dark-mode-label' : ''}>Poor</label>
            </div>
          </div>
          {/* Consistency */}
          <div className="rating-perspective">
            <label className="rating-label">Consistency:</label>
            <div className="rating-options">
              <input type="radio" id="consistency-excellent" name="consistency" value="5" checked={consistencyRating === 5} onChange={() => setConsistencyRating(5)} />
              <label htmlFor="consistency-excellent" className={theme === 'dark' ? 'dark-mode-label' : ''}>Excellent</label>
              <input type="radio" id="consistency-good" name="consistency" value="4" checked={consistencyRating === 4} onChange={() => setConsistencyRating(4)} />
              <label htmlFor="consistency-good" className={theme === 'dark' ? 'dark-mode-label' : ''}>Good</label>
              <input type="radio" id="consistency-average" name="consistency" value="3" checked={consistencyRating === 3} onChange={() => setConsistencyRating(3)} />
              <label htmlFor="consistency-average" className={theme === 'dark' ? 'dark-mode-label' : ''}>Average</label>
              <input type="radio" id="consistency-bad" name="consistency" value="2" checked={consistencyRating === 2} onChange={() => setConsistencyRating(2)} />
              <label htmlFor="consistency-bad" className={theme === 'dark' ? 'dark-mode-label' : ''}>Bad</label>
              <input type="radio" id="consistency-poor" name="consistency" value="1" checked={consistencyRating === 1} onChange={() => setConsistencyRating(1)} />
              <label htmlFor="consistency-poor" className={theme === 'dark' ? 'dark-mode-label' : ''}>Poor</label>
            </div>
          </div>
          <textarea
            className={`textual-feedback-textarea ${theme === 'dark' ? 'dark-mode' : ''}`}
            style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}
            placeholder="Additional feedback..."
            value={textualFeedback}
            onChange={handleTextualFeedbackChange}
          />
          {/* Submit rating button */}
          <button 
              className={`submit-rating-btn ${theme === 'dark' ? 'dark-mode-btn' : ''}`} 
              onClick={submitRating}
              disabled={isFeedbackSubmitted} // Disable button if feedback is already submitted
          >
              {isFeedbackSubmitted ? 'Submitted' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateSummary;
