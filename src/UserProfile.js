import React, { useEffect, useState } from 'react';
import PieChartComp from './PieChartComp'; // Import component to display pie chart
import BarGraphComp from './BarGraphComp'; // Import component to display bar graph
import './UserProfile.css'; // Import CSS file for styling
import axios from 'axios';
import { useCookies } from 'react-cookie';
import Select from 'react-select'; // Import React Select

const UserProfile = ( {user_id} ) => {
  // Destructure the props to extract userData, pieChartData, and barGraphData
  const [ userData, setUserData ] = useState({});
  const [ ratingData, setRatingData ] = useState([]);

  const [selectedFeedback, setSelectedFeedback] = useState(null); // State to store selected feedback
  const [feedbackMap, setFeedbackMap] = useState({}); 

  const [cookies, setCookie] = useCookies(['jwtToken']); // Retrieve the 'jwtToken' cookie

  useEffect(() => {
    setUserData({});
    setRatingData([]);
    if (cookies.jwtToken) {
      getUserRatingsData()
      getUserFeedbacks(user_id);
    }
  }, [cookies.jwtToken]);

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
      {userData && (
        <div className="user-data-container">
            <h2>User Data:</h2>
            <p>Name: {userData.username}</p>
            <p>Email: {userData.email}</p>
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
        <div className="pie-chart-container">
          <h2>Pie Chart:</h2>
          <div>
            {ratingData ? (
                <PieChartComp data={ratingData} />
            ) : (
                <p>No data available</p>
            )}
          </div>
        </div>
        
        {/* Display bar graph */}
        <div className="bar-graph-container">
          <h2>Bar Graph:</h2>
          <div>
            {ratingData ? (
                <BarGraphComp data={ratingData} />
            ) : (
                <p>No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
