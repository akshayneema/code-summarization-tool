import React, { useEffect, useState } from 'react';
import PieChartComp from './PieChartComp'; // Import component to display pie chart
import BarGraphComp from './BarGraphComp'; // Import component to display bar graph
import './UserProfile.css'; // Import CSS file for styling
import axios from 'axios';
import { useCookies } from 'react-cookie';
import Select from 'react-select'; // Import React Select

const UserProfile = ( {user_id, user_name, user_email} ) => {
  // Destructure the props to extract userData, pieChartData, and barGraphData
  const [ userName, setUserName ] = useState('');
  const [ userEmail, setUserEmail ] = useState('');
  const [ ratingData, setRatingData ] = useState([]);

  const [selectedFeedback, setSelectedFeedback] = useState(null); // State to store selected feedback
  const [feedbackMap, setFeedbackMap] = useState({}); 

  const [chartType, setChartType] = useState('pie');

  const [cookies, setCookie] = useCookies(['jwtToken']); // Retrieve the 'jwtToken' cookie
  const [emailError, setEmailError] = useState('');
  const [ successMessage, setSuccessMessage] = useState(false);

  useEffect(() => {
    setUserName(user_name);
    setUserEmail(user_email);
    setRatingData([]);
    if (cookies.jwtToken) {
      getUserRatingsData()
      getUserFeedbacks(user_id);
    }
  }, [cookies.jwtToken]);

  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    // Regular expression for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Check if inputEmail matches the emailRegex
    setUserEmail(inputEmail);
    if (emailRegex.test(inputEmail)) {
      // If valid, update the email state
      setEmailError('');
    } else {
      // If not valid, you may show an error message or handle it as per your requirement
      setEmailError('Please enter a valid email');
    }
  };

// Function to handle updating admin data
const handleUpdate = async () => {
    if (emailError) {
        console.log("Please enter a valid email before proceeding")
    } else {
        const response = await axios.post(
            'http://127.0.0.1:5000/update-profile',
            { 'username': userName, 'email': userEmail }, // Request body
            {
                headers: {
                    Authorization: `Bearer ${cookies.jwtToken}`, // Send token as a header
                }
            }
        );
        if (response.data && response.data.status == 'True') {
            setSuccessMessage(true);
            setTimeout(() => {
                setSuccessMessage(false);
            }, 2000);
        }
    }
  };

  const handleChartChange = (e) => {
    setChartType(e.target.value);
  };

  const getUserRatingsData = async () => {
    try {
      const response = await axios.post(`http://127.0.0.1:5000/feedback-averages`, {
        user_id_list: [user_id], // Pass user ids in the request body
      },
      {
        headers: {
          Authorization: `Bearer ${cookies.jwtToken}`,
        },
      });
      if (response.data && response.data.avg_naturalness) {
        const naturalness = {
            'name': 'Average Naturalness',
            'rating': response.data.avg_naturalness
        };
        const usefulness = {
            'name': 'Average Usefulness',
            'rating': response.data.avg_usefulness
        };
        const consistency = {
            'name': 'Average Consistency',
            'rating': response.data.avg_consistency
        };
        setRatingData([
            naturalness,
            usefulness,
            consistency
        ]);
      } else {
        console.log("User ratings data is not available")
      }
    } catch (error) {
      console.log("Error while getting user ratings data")
    }
  };

  const getUserFeedbacks = async (user_id) => {
    try {
        const response = await axios.get(`http://127.0.0.1:5000/user/${user_id}/get-feedbacks`);
        const feedbacks = response.data;

        // Create a map of feedback IDs to feedback objects
        const feedbacksMap = {};
        feedbacks.forEach((feedback) => {
            feedbacksMap[feedback.id] = feedback;
        });

        // Assuming setFeedbacksMap is a function to set the feedbacks map in your UI
        setFeedbackMap(feedbacksMap);
    } catch (error) {
        console.error('Error fetching user feedbacks:', error);
    }
  };

  const handleFeedbackSelect = (selectedOption) => {
    setSelectedFeedback(selectedOption);
  };

  return (
    <div className="user-profile-container">
      <div className="data-feedback-container">
       {/* Display user data */}
    {userName && (
      <div className="user-data-container">
        <h2>User Data:</h2>
        {/* Name input field */}
        <div className="user-data-item">
            <h3>Name:</h3>
            <input
            type="text"
            placeholder="Enter name"
            className="input-name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            />
        </div>
        {/* Email input field */}
        <div className="user-data-item">
            <h3>Email:</h3>
            <input
            type="email"
            placeholder="Enter email"
            className="input-email"
            value={userEmail}
            onChange={handleEmailChange}
            />
        </div>
      {emailError && <p className="error-message">{emailError}</p>}
      {/* Button to update admin data */}
      <button onClick={handleUpdate} className='update-button'>Update</button>
      {successMessage && <p>Admin profile updated successfully</p> }
    </div>
      )}

      <div className="feedback-container">
          <h2>Feedback History:</h2>
          <Select
            value={selectedFeedback}
            onChange={handleFeedbackSelect}
            options={Object.values(feedbackMap).map(feedback => ({
              value: feedback.id,
              label: `Feedback ${feedback.id}`
            }))}
          />
          {selectedFeedback && feedbackMap[selectedFeedback.value] && (
            <div className="feedback-details">
              <h3>Feedback Details:</h3>
              <p>Language: {feedbackMap[selectedFeedback.value].language}</p>
              <p>Model: {feedbackMap[selectedFeedback.value].model}</p>
              <p>Code: {feedbackMap[selectedFeedback.value].code}</p>
              <p>Summary: {feedbackMap[selectedFeedback.value].summary}</p>
              <p>Naturalness Rating: {feedbackMap[selectedFeedback.value].naturalness_rating}</p>
              <p>Usefulness Rating: {feedbackMap[selectedFeedback.value].usefulness_rating}</p>
              <p>Consistency Rating: {feedbackMap[selectedFeedback.value].consistency_rating}</p>
              <p>Textual Feedback: {feedbackMap[selectedFeedback.value].textual_feedback}</p>
              <p>Created At: {feedbackMap[selectedFeedback.value].created_at}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Display pie chart */}
      <div className="charts-container">
        {/* Dropdown to select chart type */}
        <div className="chart-selector">
          <label htmlFor="chartType">Select Chart Type: </label>
          <select id="chartType" value={chartType} onChange={handleChartChange}>
            <option value="pie">Pie Chart</option>
            <option value="bar">Bar Graph</option>
          </select>
        </div>

        {/* Display selected chart */}
        {chartType === 'pie' && (
          <div className="pie-chart-container">
            <h2>Pie Chart:</h2>
            <div>
              <PieChartComp data={ratingData} />
            </div>
          </div>
        )}

        {chartType === 'bar' && (
          <div className="bar-graph-container">
            <h2>Bar Graph:</h2>
            <div>
              <BarGraphComp data={ratingData} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
