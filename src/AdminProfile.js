import React, { useEffect, useState } from 'react';
import PieChartComp from './PieChartComp'; // Import component to display pie chart
import BarGraphComp from './BarGraphComp'; // Import component to display bar graph
import './AdminProfile.css'; // Import CSS file for styling
import axios from 'axios';
import { useCookies } from 'react-cookie';

const AdminProfile = ({ admin_name, admin_email }) => {
// Destructure the props to extract adminData, pieChartData, and barGraphData
const [ ratingData, setRatingData ] = useState([]);
const [cookies, setCookie] = useCookies(['jwtToken']); // Retrieve the 'jwtToken' cookie
const [adminName, setAdminName] = useState('');
const [adminEmail, setAdminEmail] = useState('');

useEffect(() => {
  setRatingData([]);
  setAdminName(admin_name);
  setAdminEmail(admin_email);
  if (cookies.jwtToken) {
    getUserRatingsData()
  }
}, [cookies.jwtToken]);

// Function to handle updating admin data
const handleUpdate = () => {
    // Logic to update admin data (you can replace this with your own logic)
    // For example, you might send a request to update the data on the server
    console.log("Updating admin data...");
  };

const getUserRatingsData = async () => {
  try {
    const response = await axios.get(`http://127.0.0.1:5000/average-ratings`, {
      headers: {
        Authorization: `Bearer ${cookies.jwtToken}`, // Send token as a header
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

return (
  <div className="admin-profile-container">
    {/* Display user data */}
    {adminName && (
      <div className="admin-data-container">
        <h2>Admin Data:</h2>
        {/* Name input field */}
        <div className="admin-data-item">
            <h3>Name:</h3>
            <input
            type="text"
            placeholder="Enter name"
            className="input-name"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            />
        </div>
        {/* Email input field */}
        <div className="admin-data-item">
            <h3>Email:</h3>
            <input
            type="email"
            placeholder="Enter email"
            className="input-email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            />
        </div>
      {/* Button to update admin data */}
      <button onClick={handleUpdate} className='update-button'>Update</button>
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

export default AdminProfile;
