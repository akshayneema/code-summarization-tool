import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import App from './App';
import '@testing-library/jest-dom';

jest.mock('axios');

describe('App', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form when not logged in', () => {
    const { getByPlaceholderText, getByText, getElementsByClassName } = render(<App />);
    expect(getByPlaceholderText('Username')).toBeInTheDocument();
    expect(getByPlaceholderText('Password')).toBeInTheDocument();
    // Find the login button by its class name
    const loginButton = document.getElementsByClassName('login-button')[0];
    expect(loginButton).toBeInTheDocument();
  });

  // it('renders home page when logged in', async () => {
  //   axios.get.mockResolvedValueOnce({ data: { status: 'True', user_id: 1, role: 'user', username: 'testuser', email: 'test@example.com' } });
  //   const { getByText, queryByLabelText } = render(<App />);
  //   await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
  //   expect(getByText('Home')).toBeInTheDocument();
  //   expect(getByText('Profile')).toBeInTheDocument();
  //   expect(getByText('Logout')).toBeInTheDocument();
  //   expect(queryByLabelText('Username')).not.toBeInTheDocument();
  // });

  // it('logs out when logout button is clicked', async () => {
  //   axios.get.mockResolvedValueOnce({ data: { status: 'True', user_id: 1, role: 'user', username: 'testuser', email: 'test@example.com' } });
  //   const { getByText } = render(<App />);
  //   await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
  //   fireEvent.click(getByText('Logout'));
  //   await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
  //   expect(axios.get).toHaveBeenCalledWith('http://127.0.0.1:5000/logout');
  // });

  // Add more test cases as needed for other functionalities
});

