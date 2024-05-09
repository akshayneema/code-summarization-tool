import React, { useEffect, useState } from 'react';
import PieChartComp from './PieChartComp'; // Import component to display pie chart
import BarGraphComp from './BarGraphComp'; // Import component to display bar graph
import './UserProfile.css'; // Import CSS file for styling
import axios from 'axios';
import { useCookies } from 'react-cookie';

const UserProfile = ( {user_id, user_name, user_email} ) => {
  // Destructure the props to extract userData, pieChartData, and barGraphData
  const [ userName, setUserName ] = useState('');
  const [ userEmail, setUserEmail ] = useState('');
  const [ ratingData, setRatingData ] = useState([]);
  const [cookies, setCookie] = useCookies(['jwtToken']); // Retrieve the 'jwtToken' cookie
  const [emailError, setEmailError] = useState('');
  const [ successMessage, setSuccessMessage] = useState(false);

  useEffect(() => {
    setUserName(user_name);
    setUserEmail(user_email);
    setRatingData([]);
    if (cookies.jwtToken) {
      getUserRatingsData()
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

  const getUserRatingsData = async () => {
    try {
      const response = await axios.post(`http://127.0.0.1:5000/feedback-averages`, {'user_id_list': [user_id]}, {
      headers: {
        Authorization: `Bearer ${cookies.jwtToken}`, // Send token as a header
      },
    });
      if (response.data) {
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

  return (
    <div className="user-profile-container">
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
