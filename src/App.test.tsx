import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Magnet Link Extractor window', () => {
  render(<App />);
  const titleElements = screen.getAllByText(/Magnet Link Extractor/i);
  expect(titleElements.length).toBeGreaterThan(0);
  expect(screen.getByPlaceholderText(/Paste your text here/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Extract' })).toBeInTheDocument();
});
