import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: 'buffer',
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
    // Ensure Buffer is available in the global scope
    'globalThis.Buffer': 'globalThis.Buffer || Buffer'
  },
  optimizeDeps: {
    include: ['buffer'],
    exclude: ['@solana/web3.js', '@solana/spl-token']
  },
  build: {
    rollupOptions: {
      output: {
        globals: {
          buffer: 'Buffer'
        }
      }
    }
  }
}))
