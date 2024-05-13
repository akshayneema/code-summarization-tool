import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import UserProfile from './UserProfile';

// Mock Axios POST request
jest.mock('axios');

describe('UserProfile Component', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mock calls after each test
  });

  it('should render without crashing', () => {
    render(<UserProfile user_id="1" user_name="Test User" user_email="test@example.com" />);
  });

  it('should display error message for invalid email format', async () => {
    const { getByPlaceholderText, findByText } = render(<UserProfile user_id="1" user_name="Test User" user_email="test@example.com" />);
    const emailInput = getByPlaceholderText('Enter email');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    expect(await findByText('Please enter a valid email')).toBeTruthy();
  });

  it('should call handleUpdate function on Update button click with correct inputs', async () => {
    axios.post.mockResolvedValueOnce({ data: { status: 'True' } }); // Mock successful update
    const { getByText, getByPlaceholderText } = render(<UserProfile user_id="1" user_name="Test User" user_email="test@example.com" />);
    const emailInput = getByPlaceholderText('Enter email');
    fireEvent.change(emailInput, { target: { value: 'updated-email@example.com' } });
    fireEvent.click(getByText('Update'));
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://127.0.0.1:5000/update-profile',
        { 'username': 'Test User', 'email': 'updated-email@example.com' },
        { headers: { Authorization: 'Bearer undefined' } }
      );
    });
  });
});
