import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Editor } from '@monaco-editor/react'; 
import { Select, MenuItem } from '@material-ui/core';
import './GenerateSummary.css'; // Import CSS file for component styling
import { useCookies } from 'react-cookie';

const GenerateSummary = ({userId}) => {
  // State to store code snippet input
  const [codeSnippet, setCodeSnippet] = useState('');
  // State to store generated summary
  const [summary, setSummary] = useState('');
  // States to store ratings for each perspective
  const [naturalnessRating, setNaturalnessRating] = useState(3); // Default: Average
  const [usefulnessRating, setUsefulnessRating] = useState(3); // Default: Average
  const [consistencyRating, setConsistencyRating] = useState(3); // Default: Average
  // State to track whether a summary is generated
  const [isRatingSectionOpen, setIsRatingSectionOpen] = useState(false);

  const [isSummaryGenerating, setIsSummaryGenerating] = useState(false);
  const [isBlip, setIsBlip] = useState(false); // State to trigger blip animation

  const [generationTime, setGenerationTime] = useState(null);

  const [selectedLanguage, setSelectedLanguage] = useState('Python'); // Default language is Python
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo'); // Default language is Python
  const [theme, setTheme] = useState('light'); // Default theme is light
  const [cookies, setCookie] = useCookies(['jwtToken']);

  // Effect to trigger blip animation when isSummaryGenerating is true
  useEffect(() => {
    if (isSummaryGenerating) {
      setIsBlip(true); // Enable blip animation
    } else {
      // Disable blip animation after summary generation is complete
      setIsBlip(false);
    }
  }, [isSummaryGenerating]);

  // Function to handle code snippet input change
  const handleCodeChange = (value) => {
    setCodeSnippet(value);
  };

  // Function to handle "Generate Summary" button click
  const generateSummary = async () => {
    const startTime = Date.now();
    setIsSummaryGenerating(true); // Set loading state to true
      try {
        const response = await axios.post('http://127.0.0.1:5000/generate-summary', {
          codeLanguage: selectedLanguage,
          codeSnippet: codeSnippet,
          summarizationModel: selectedModel
        });
    
        if (response.data.status == 200) {
          const summary = response.data.summary;
          setSummary(summary);
          setNaturalnessRating(3); // Average
          setUsefulnessRating(3); // Average
          setConsistencyRating(3); // Average
          setIsRatingSectionOpen(true);
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

  // Function to handle "Submit Rating" button click
  const submitRating = async () => {
    console.log('Naturalness Rating:', naturalnessRating);
    console.log('Usefulness Rating:', usefulnessRating);
    console.log('Consistency Rating:', consistencyRating);

    try {

      const response = await axios.post('http://127.0.0.1:5000/submit-feedback', {
        user_id: userId,
        language: selectedLanguage,
        model: selectedModel,
        code: codeSnippet,
        summary: summary,
        naturalness_rating: naturalnessRating,
        usefulness_rating: usefulnessRating,
        consistency_rating: consistencyRating
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }

    setIsRatingSectionOpen(false);
  };

  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
  };

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Function to handle logout
  const handleLogout = async () => {
    setCookie('jwtToken', ''); // Remove the jwtToken cookie
    const response = await axios.get('http://127.0.0.1:5000/logout');
    window.location.reload(); // Reload the page
  };

  return (
    <div className={`container ${theme === 'light' ? 'light-theme' : 'dark-theme'}`}>
      <h1 className="title">Code Summarization Tool</h1>
      <div className="header">
        <a className="logout-btn" onClick={handleLogout}>Logout</a>
      </div>
      <div className={`theme-toggle ${theme === 'light' ? 'theme-toggle-light' : 'theme-toggle-dark'}`} onClick={toggleTheme}>
        {theme === 'light' ? '🌞' : '🌙'}
      </div>
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
      <Editor
        language={selectedLanguage.toLowerCase()}
        value={codeSnippet}
        onChange={handleCodeChange}
        options={{
          minimap: {
            enabled: false
          }
        }}
        height="400px"
        disabled={isSummaryGenerating}
      />
      <br />
      {/* "Generate Summary" button */}
      <button className={`generate-btn ${isSummaryGenerating ? 'disabled' : ''}`} onClick={generateSummary} disabled={isSummaryGenerating}>Generate Summary</button>
      <hr />
      {/* Display area for generated summary */}
      <div className={`summary-container ${isBlip ? 'blip' : ''}`}>
        <h2 className="summary-title">Generated Summary:</h2>
        {isSummaryGenerating ? (
          <p className="loading-message">Hold on a sec while I get your summary...</p>
        ) : (
          <>
            <p className="summary">{summary}</p>
            <div className="generation-time">
              {generationTime !== null && (
                <p>Summary generated in {generationTime} seconds.</p>
              )}
            </div>
          </>
        )}
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
        {/* Submit rating button */}
        <button className={`submit-rating-btn ${theme === 'dark' ? 'dark-mode-btn' : ''}`} onClick={submitRating}>Submit Rating</button>
      </div>
    </div>
  );
};

export default GenerateSummary;
