import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import Register from './Register';

// Mock Axios POST request
jest.mock('axios');

describe('Register Component', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mock calls after each test
  });

  it('should render without crashing', () => {
    render(<Register onSuccess={() => {}} onLoginClick={() => {}} />);
  });

  it('should display error message for invalid email format', () => {
    const { getByPlaceholderText, getByText } = render(<Register onSuccess={() => {}} onLoginClick={() => {}} />);
    
    const emailInput = getByPlaceholderText('Email');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    expect(getByText('Please enter a valid email')).toBeTruthy();
  });

  it('should display error messages for invalid password format', () => {
    const { getByPlaceholderText, getByText } = render(<Register onSuccess={() => {}} onLoginClick={() => {}} />);
    
    const passwordInput = getByPlaceholderText('Password');
    fireEvent.change(passwordInput, { target: { value: 'weak' } });

    expect(getByText('Password must be at least 8 characters long.')).toBeTruthy();
    expect(getByText('Password must contain at least one uppercase letter.')).toBeTruthy();
    expect(getByText('Password must contain at least one number.')).toBeTruthy();
    expect(getByText('Password must contain at least one special character.')).toBeTruthy();
  });

  it('should display error message when passwords do not match', () => {
    const { getByPlaceholderText, getByText } = render(<Register onSuccess={() => {}} onLoginClick={() => {}} />);
    
    const passwordInput = getByPlaceholderText('Password');
    const confirmPasswordInput = getByPlaceholderText('Confirm Password');

    fireEvent.change(passwordInput, { target: { value: 'StrongPassword123#' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'MismatchedPassword' } });

    expect(getByText('Passwords do not match !!!')).toBeTruthy();
  });

  it('should call handleRegister function on Register button click with correct inputs', async () => {
    axios.post.mockResolvedValueOnce({ data: { status: 'True' } }); // Mock successful registration
    
    const onSuccessMock = jest.fn();
    const { getByTestId, getByPlaceholderText } = render(<Register onSuccess={onSuccessMock} onLoginClick={() => {}} />);
    
    fireEvent.change(getByPlaceholderText('Username'), { target: { value: 'testUser' } });
    fireEvent.change(getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(getByPlaceholderText('Password'), { target: { value: 'StrongPassword123#' } });
    fireEvent.change(getByPlaceholderText('Confirm Password'), { target: { value: 'StrongPassword123#' } });

    fireEvent.click(getByTestId('register-button'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://127.0.0.1:5000/register', {
        username: 'testUser',
        email: 'test@example.com',
        password: 'StrongPassword123#',
        role: 'user'
      });
      expect(onSuccessMock).toHaveBeenCalled();
    });
  });
});
