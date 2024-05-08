import React from 'react';
import UserData from './UserData'; // Import component to display user data
import PieChartComp from './PieChartComp'; // Import component to display pie chart
import BarGraph from './BarGraphComp'; // Import component to display bar graph
import './UserProfile.css'; // Import CSS file for styling

const UserProfile = ({ userData, pieChartData, barGraphData }) => {
  // Destructure the props to extract userData, pieChartData, and barGraphData
  const { name, age, email, location } = userData;

  return (
    <div className="user-profile-container">
      {/* Display user data */}
      <div className="user-data-container">
        <h2>User Data:</h2>
        <p>Name: {name}</p>
        <p>Age: {age}</p>
        <p>Email: {email}</p>
        <p>Location: {location}</p>
      </div>
      
      {/* Display pie chart */}
      <div className="charts-container">
        <div className="pie-chart-container">
          <h2>Pie Chart:</h2>
          <PieChartComp data={pieChartData} />
        </div>
        
        {/* Display bar graph */}
        <div className="bar-graph-container">
          <h2>Bar Graph:</h2>
          <BarGraph data={barGraphData} />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
