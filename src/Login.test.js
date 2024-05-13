import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';

describe('Login Component', () => {
  it('should render without crashing', () => {
    render(<Login />);
  });

  it('should call handleLogin function on button click with correct credentials', async () => {
    const onSuccessMock = jest.fn();
    const { getByTestId, getByPlaceholderText } = render(<Login onSuccess={onSuccessMock} onRegisterClick={() => {}} />);

    // Mocking input values
    fireEvent.change(getByPlaceholderText('Username'), { target: { value: 'admin' } });
    fireEvent.change(getByPlaceholderText('Password'), { target: { value: 'admin' } });

    // Click the login button
    fireEvent.click(getByTestId('login-button'));

    await waitFor(() => {
      expect(onSuccessMock).toHaveBeenCalled();
    });
  });

  it('should show error message for invalid credentials', async () => {
    const { getByText, getByPlaceholderText, getByTestId } = render(<Login onSuccess={() => {}} onRegisterClick={() => {}} />);
    
    // Mocking invalid input values
    fireEvent.change(getByPlaceholderText('Username'), { target: { value: 'invalidUsername' } });
    fireEvent.change(getByPlaceholderText('Password'), { target: { value: 'invalidPassword' } });

    // Click the login button
    fireEvent.click(getByTestId('login-button'));

    await waitFor(() => {
        expect(getByTestId('invalid-username').textContent).toBe('Invalid Username or Password');
    });
  });

  it('should toggle password visibility', () => {
    const { getByTestId } = render(<Login onSuccess={() => {}} onRegisterClick={() => {}} />);
    
    // Initial password type should be 'password'
    expect(getByTestId('password-input').type).toBe('password');

    // Click the eye icon to toggle password visibility
    fireEvent.click(getByTestId('toggle-password-visibility'));

    // After clicking, password type should change to 'text'
    expect(getByTestId('password-input').type).toBe('text');
  });

  
});
