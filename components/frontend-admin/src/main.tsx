import { BrowserRouter } from 'react-router';
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';

import './style.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
