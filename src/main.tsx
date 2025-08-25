// Buffer polyfill - must be done before any other imports
import { Buffer } from 'buffer';

// Make Buffer available globally before any other modules load
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
  (window as any).global = globalThis;
}
if (typeof globalThis !== 'undefined') {
  (globalThis as any).Buffer = Buffer;
}

// Now import React and other modules
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
