import React, { useEffect, useState } from 'react';
import PieChartComp from './PieChartComp'; // Import component to display pie chart
import BarGraphComp from './BarGraphComp'; // Import component to display bar graph
import './UserProfile.css'; // Import CSS file for styling
import axios from 'axios';
import { useCookies } from 'react-cookie';

const UserProfile = ( {user_id} ) => {
  // Destructure the props to extract userData, pieChartData, and barGraphData
  const [ userData, setUserData ] = useState({});
  const [ ratingData, setRatingData ] = useState([]);
  const [cookies, setCookie] = useCookies(['jwtToken']); // Retrieve the 'jwtToken' cookie

  useEffect(() => {
    setUserData({});
    setRatingData([]);
    if (cookies.jwtToken) {
      getUserRatingsData()
    }
  }, [cookies.jwtToken]);

  const getUserRatingsData = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/average-ratings/${user_id}`, {
        headers: {
          Authorization: `Bearer ${cookies.jwtToken}`, // Send token as a header
        },
      });
      if (response.data && response.data.username) {
        setUserData({
            "username": response.data.username || "",
            "email": response.data.email || ""
        });
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
      {userData && (
        <div className="user-data-container">
            <h2>User Data:</h2>
            <p>Name: {userData.username}</p>
            <p>Email: {userData.email}</p>
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
