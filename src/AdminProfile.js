import React, { useEffect, useState } from 'react';
import PieChartComp from './PieChartComp'; // Import component to display pie chart
import BarGraphComp from './BarGraphComp'; // Import component to display bar graph
import './AdminProfile.css'; // Import CSS file for styling
import axios from 'axios';
import { useCookies } from 'react-cookie';
import Select from 'react-select'; // Import React Select

const AdminProfile = ({ admin_name, admin_email }) => {
// Destructure the props to extract adminData, pieChartData, and barGraphData
const [ ratingData, setRatingData ] = useState([]);
const [cookies, setCookie] = useCookies(['jwtToken']); // Retrieve the 'jwtToken' cookie
const [adminName, setAdminName] = useState('');
const [adminEmail, setAdminEmail] = useState('');
const [emailError, setEmailError] = useState('');
const [selectedUsers, setSelectedUsers] = useState([]); 
const [userOptions, setUserOptions] = useState([]);

useEffect(() => {
  setRatingData([]);
  setAdminName(admin_name);
  setAdminEmail(admin_email);
  if (cookies.jwtToken) {
    getUserRatingsData();
    fetchUsers();
  }
}, [cookies.jwtToken]);

const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    // Regular expression for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Check if inputEmail matches the emailRegex
    setAdminEmail(inputEmail);
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
        const response = await axios.post('http://127.0.0.1:5000/update-profile', { adminName, adminEmail });
    }
  };

const getUserRatingsData = async () => {
  try {
    const userIds = selectedUsers.map(user => user.value); // Extract user ids from selectedUsers
    const response = await axios.post(
      `http://127.0.0.1:5000/feedback-averages`,
      {
        user_id_list: userIds, // Pass user ids in the request body
      },
      {
        headers: {
          Authorization: `Bearer ${cookies.jwtToken}`,
        },
      }
    );
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

// Function to fetch users from the backend
const fetchUsers = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:5000/get-users'); // Replace with your API endpoint
    const users = response.data.users.map((user) => ({
      value: user.id,
      label: user.username,
    }));
    setUserOptions(users);
  } catch (error) {
    console.log('Error fetching users:', error);
  }
};

const handleSelectChange = (selectedOptions) => {
  setSelectedUsers(selectedOptions);
};

useEffect(() => {
  getUserRatingsData();
}, [selectedUsers]);

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
            onChange={handleEmailChange}
            />
        </div>
      {/* Button to update admin data */}
      <button onClick={handleUpdate} className='update-button'>Update</button>
    </div>
      )}
    
    
    {/* Display pie chart */}
    <div className="charts-container">
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span>Select Users:&nbsp;&nbsp;</span>
      <Select
        options={userOptions}
        isMulti
        onChange={handleSelectChange}
        placeholder={selectedUsers.length > 0 ? 'Selected Users' : 'Showing All Users'}
        value={selectedUsers}
        styles={{
          menu: (provided, state) => ({
            ...provided,
            marginTop: 0, // Adjust the marginTop to 0
          }),
        }}
      />

    </div>

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
