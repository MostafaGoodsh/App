// Buffer polyfill - MUST be first, before any imports
import { Buffer } from 'buffer';

// Set Buffer globally immediately
window.Buffer = Buffer;
(window as any).global = globalThis;
(globalThis as any).Buffer = Buffer;

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
