import React, { useEffect, useState } from 'react';
import PieChartComp from './PieChartComp'; // Import component to display pie chart
import BarGraphComp from './BarGraphComp'; // Import component to display bar graph
import './AdminProfile.css'; // Import CSS file for styling
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { Tune } from '@material-ui/icons';

const AdminProfile = ({ admin_name, admin_email }) => {
// Destructure the props to extract adminData, pieChartData, and barGraphData
const [ ratingData, setRatingData ] = useState([]);
const [cookies, setCookie] = useCookies(['jwtToken']); // Retrieve the 'jwtToken' cookie
const [adminName, setAdminName] = useState('');
const [adminEmail, setAdminEmail] = useState('');
const [emailError, setEmailError] = useState('');
const [ successMessage, setSuccessMessage] = useState(false);
const [newUserName, setNewUserName] = useState('');
const [newUserEmail, setNewUserEmail] = useState('');
const [newUserEmailError, setNewUserEmailError] = useState('');
const [ addUserSuccessMessage, setAddUserSuccessMessage] = useState(false);
const [ addUserErrorMessage, setAddUserErrorMessage] = useState('');
const [newAdminName, setNewAdminName] = useState('');
const [newAdminEmail, setNewAdminEmail] = useState('');
const [newAdminEmailError, setNewAdminEmailError] = useState('');
const [ addAdminSuccessMessage, setAddAdminSuccessMessage] = useState(false);
const [ addAdminErrorMessage, setAddAdminErrorMessage] = useState('');

useEffect(() => {
  setRatingData([]);
  setAdminName(admin_name);
  setAdminEmail(admin_email);
  if (cookies.jwtToken) {
    getUserRatingsData()
  }
}, [cookies.jwtToken]);

const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    // Regular expression for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Check if inputEmail matches the emailRegex
    setAdminEmail(inputEmail);
    if (inputEmail == '' || emailRegex.test(inputEmail)) {
      // If valid, update the email state
      setEmailError('');
    } else {
      // If not valid, you may show an error message or handle it as per your requirement
      setEmailError('Please enter a valid email');
    }
  };

const handleNewUserEmailChange = (e) => {
    const inputEmail = e.target.value;
    // Regular expression for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Check if inputEmail matches the emailRegex
    setNewUserEmail(inputEmail);
    if (inputEmail == '' || emailRegex.test(inputEmail)) {
      // If valid, update the email state
      setNewUserEmailError('');
    } else {
      // If not valid, you may show an error message or handle it as per your requirement
      setNewUserEmailError('Please enter a valid email');
    }
  };

const handleNewAdminEmailChange = (e) => {
    const inputEmail = e.target.value;
    // Regular expression for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Check if inputEmail matches the emailRegex
    setNewAdminEmail(inputEmail);
    if (inputEmail == '' || emailRegex.test(inputEmail)) {
      // If valid, update the email state
      setNewAdminEmailError('');
    } else {
      // If not valid, you may show an error message or handle it as per your requirement
      setNewAdminEmailError('Please enter a valid email');
    }
  };

// Function to handle updating admin data
const handleUpdate = async () => {
    if (emailError) {
        console.log("Please enter a valid email before proceeding")
    } else {
        const response = await axios.post(
            'http://127.0.0.1:5000/update-profile',
            { 'username': adminName, 'email': adminEmail }, // Request body
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

const handleAddUserOrAdmin = async (username, email, role) => {
    const response = await axios.post(
        'http://127.0.0.1:5000/register',
        { 'username': username, 'email': email, 'password': 'password', 'role': role }, // Request body
    );
    if (response.data && response.data.status == 'True') {
        if (role == 'admin') {
            setAddAdminSuccessMessage(true);
            setTimeout(() => {
                setAddAdminSuccessMessage(false);
            }, 2000);
            setNewAdminName('');
            setNewAdminEmail('');
        } else {
            setAddUserSuccessMessage(true);
            setTimeout(() => {
                setAddUserSuccessMessage(false);
            }, 2000);
            setNewUserName('');
            setNewUserEmail('');
        }
    } else {
        if (response.data && response.data.message) {
            if (role == 'admin') {
                setAddAdminErrorMessage(response.data.message);
                setTimeout(() => {
                    setAddAdminErrorMessage('');
                }, 2000);
            } else {
                setAddUserErrorMessage(response.data.message);
                setTimeout(() => {
                    setAddUserErrorMessage('');
                }, 2000);
            }
        }
    }
}

// Function to handle adding new user
const handleAddUser =  () => {
    if (newUserEmailError) {
        console.log("Please enter a valid email before proceeding");
    } else {
        handleAddUserOrAdmin(newUserName, newUserEmail, 'user');
    }
  };

// Function to handle adding new user
const handleAddAdmin =  () => {
    if (newAdminEmailError) {
        console.log("Please enter a valid email before proceeding");
    } else {
        handleAddUserOrAdmin(newAdminName, newAdminEmail, 'admin');
    }
  };

const getUserRatingsData = async () => {
  try {
    const response = await axios.post(`http://127.0.0.1:5000/feedback-averages`, {'user_id_list': []}, {
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
            onChange={handleEmailChange}
            />
        </div>
      {emailError && <p className="error-message">{emailError}</p>}
      {/* Button to update admin data */}
      <button onClick={handleUpdate} className='update-button'>Update</button>
      {successMessage && <p className='success-message'>Admin profile updated successfully</p> }

      <h2>Add New User:</h2>
        {/* Name input field */}
        <div className="admin-data-item">
            <h3>User Name:</h3>
            <input
            type="text"
            placeholder="Enter name"
            className="input-name"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            />
        </div>
        {/* Email input field */}
        <div className="admin-data-item">
            <h3>User Email:</h3>
            <input
            type="email"
            placeholder="Enter email"
            className="input-email"
            value={newUserEmail}
            onChange={handleNewUserEmailChange}
            />
        </div>
      {newUserEmailError && <p className="error-message">{newUserEmailError}</p>}
      {addUserErrorMessage && <p className="error-message">{addUserErrorMessage}</p>}
      {/* Button to update admin data */}
      <button onClick={handleAddUser} className='update-button'>Add User</button>
      {addUserSuccessMessage && <p className='success-message'>New user created successfully</p> }

      <h2>Add New Admin:</h2>
        {/* Name input field */}
        <div className="admin-data-item">
            <h3>Admin Name:</h3>
            <input
            type="text"
            placeholder="Enter name"
            className="input-name"
            value={newAdminName}
            onChange={(e) => setNewAdminName(e.target.value)}
            />
        </div>
        {/* Email input field */}
        <div className="admin-data-item">
            <h3>Admin Email:</h3>
            <input
            type="email"
            placeholder="Enter email"
            className="input-email"
            value={newAdminEmail}
            onChange={handleNewAdminEmailChange}
            />
        </div>
      {newAdminEmailError && <p className="error-message">{newAdminEmailError}</p>}
      {addAdminErrorMessage && <p className="error-message">{addAdminErrorMessage}</p>}
      {/* Button to update admin data */}
      <button onClick={handleAddAdmin} className='update-button'>Add Admin</button>
      {addAdminSuccessMessage && <p className='success-message'>New admin created successfully</p> }
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
