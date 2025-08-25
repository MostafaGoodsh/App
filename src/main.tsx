import { Buffer } from 'buffer';

// Polyfill for Buffer - must be done before any other imports
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
  (window as any).global = globalThis;
}
if (typeof globalThis !== 'undefined') {
  (globalThis as any).Buffer = Buffer;
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
