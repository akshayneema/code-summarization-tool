// UserData.js

import React from 'react';

const UserData = ({ userData }) => {
  return (
    <div className="user-data">
      <h2>User Data</h2>
      <p>Name: {userData.name}</p>
      <p>Email: {userData.email}</p>
      {/* Add more user data fields as needed */}
    </div>
  );
};

export default UserData;
