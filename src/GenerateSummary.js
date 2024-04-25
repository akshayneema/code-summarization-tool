import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Editor } from '@monaco-editor/react'; 
import { Select, MenuItem } from '@material-ui/core';

const GenerateSummary = () => {
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

  const [selectedLanguage, setSelectedLanguage] = useState('python'); // Default language is Python
  const [theme, setTheme] = useState('light'); // Default theme is light

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
    setIsSummaryGenerating(true); // Set loading state to true
    try {
      // Call the backend API to generate summary
      const response = await axios.post('http://127.0.0.1:5000/generate-summary', {
        codeSnippet: codeSnippet
      });

      // Extract and set the generated summary
      setSummary(response.data[0]['summary_text']);
      // Reset ratings to default values when generating a new summary
      setNaturalnessRating(3); // Average
      setUsefulnessRating(3); // Average
      setConsistencyRating(3); // Average
      setIsRatingSectionOpen(true);
    } catch (error) {
      console.error('Error generating summary:', error);
    }
    setIsSummaryGenerating(false); 
  };

  // Function to handle "Submit Rating" button click
  const submitRating = () => {
    // Placeholder logic: Send ratings to backend
    console.log('Naturalness Rating:', naturalnessRating);
    console.log('Usefulness Rating:', usefulnessRating);
    console.log('Consistency Rating:', consistencyRating);
    setIsRatingSectionOpen(false);

  };

  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`container ${theme === 'light' ? 'light-theme' : 'dark-theme'}`}>
      <h1 className="title">Code Summarization Tool</h1>
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
      <Editor
        language="python"
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
          <p className="summary">{summary}</p>
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