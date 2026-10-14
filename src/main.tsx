import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Remove the static fallback content (index.html) now that React is taking
// over — it only exists so crawlers that don't run JavaScript see the same
// content a real visitor does, instead of an empty page.
document.getElementById('prerender-fallback')?.remove();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
