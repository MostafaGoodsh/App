// Polyfills that must load before any other app code.
// This is required for some web3 libs (e.g. @solana/spl-token) that expect Node globals.

import { Buffer } from "buffer";

// Ensure global and Buffer exist before other modules execute
const g = globalThis as any;

if (!g.global) g.global = globalThis;
if (!g.Buffer) g.Buffer = Buffer;

// Some libraries reference window.Buffer as well
if (typeof window !== "undefined") {
  (window as any).global = globalThis;
  (window as any).Buffer = g.Buffer;
}
