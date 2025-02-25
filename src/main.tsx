
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Failed to find the root element');
}

try {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (error) {
  console.error('Error rendering the application:', error);
  // Display a fallback UI if rendering fails
  container.innerHTML = '<div style="padding: 20px; text-align: center;">Something went wrong. Please try refreshing the page.</div>';
}
