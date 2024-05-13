import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import AdminProfile from './AdminProfile';

// Mock Axios POST request
jest.mock('axios');

describe('AdminProfile Component', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mock calls after each test
  });

  it('should render without crashing', () => {
    render(<AdminProfile admin_name="Admin User" admin_email="admin@example.com" />);
  });

  it('should display error message for invalid admin email format', async () => {
    const { getByTestId, findByText } = render(<AdminProfile admin_name="Admin User" admin_email="admin@example.com" />);
    const emailInput = getByTestId('admin-data-email');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    expect(await findByText('Please enter a valid email')).toBeTruthy();
  });

  it('should display error message for invalid new user email format', async () => {
    const { getByTestId, findByText } = render(<AdminProfile admin_name="Admin User" admin_email="admin@example.com" />);
    const emailInput = getByTestId('new-user-email');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    expect(await findByText('Please enter a valid email')).toBeTruthy();
  });

  it('should display error message for invalid new admin email format', async () => {
    const { getByTestId, findByText } = render(<AdminProfile admin_name="Admin User" admin_email="admin@example.com" />);
    const emailInput = getByTestId('new-admin-email');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    expect(await findByText('Please enter a valid email')).toBeTruthy();
  });

  it('should call handleUpdate function on Update button click with correct inputs', async () => {
    axios.post.mockResolvedValueOnce({ data: { status: 'True' } }); // Mock successful update
    const { getByTestId } = render(<AdminProfile admin_name="Admin User" admin_email="admin@example.com" />);
    const emailInput = getByTestId('admin-data-email');
    fireEvent.change(emailInput, { target: { value: 'updated-email@example.com' } });
    fireEvent.click(getByTestId('update-admin-date-button'));
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://127.0.0.1:5000/update-profile',
        { 'username': 'Admin User', 'email': 'updated-email@example.com' },
        { headers: { Authorization: 'Bearer undefined' } }
      );
    });
  });

});
