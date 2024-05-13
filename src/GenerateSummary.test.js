import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import GenerateSummary from './GenerateSummary';

describe('GenerateSummary Component', () => {
  test('renders GenerateSummary component', () => {
    render(<GenerateSummary />);
  });

  test('generates summary on button click', async () => {
    const { getByText } = render(<GenerateSummary />);
    const generateButton = getByText('Generate Summary');
    fireEvent.click(generateButton);
    await waitFor(() => {
      expect(getByText('Hold on a sec while I get your summary...')).toBeTruthy();
    });
  });

//   test('submits feedback on button click', async () => {
//     const { getByText, getByPlaceholderText } = render(<GenerateSummary />);
//     const submitButton = getByText('Submit Rating');
//     const feedbackTextarea = getByPlaceholderText('Additional feedback...');

//     fireEvent.change(feedbackTextarea, { target: { value: 'This is a test feedback' } });
//     fireEvent.click(submitButton);

//     await waitFor(() => {
//       expect(getByText('Submitted')).toBeTruthy();
//     });
//   });

//   test('selects a programming language', () => {
//     const { getByTestId, getByLabelText } = render(<GenerateSummary />);
//     // const languageDropdown = getByTestId('handle-language-dropdown');

//     fireEvent.change(getByLabelText('Select Language:'), { target: { value: 'Python' } });
    
//     // fireEvent.change(languageDropdown, { target: { value: 'Python' } });

//     expect(languageDropdown.value).toBe('Python');
//   });

//   test('selects a summarization model', () => {
//     const { getByLabelText } = render(<GenerateSummary />);
//     const modelDropdown = getByLabelText('Select Model:');
    
//     fireEvent.change(modelDropdown, { target: { value: 'gpt-4' } });

//     expect(modelDropdown.value).toBe('gpt-4');
//   });
});
