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
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      util: 'util'
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  optimizeDeps: {
    include: [
      'buffer', 
      'eventemitter3',
      'bn.js',
      '@solana/web3.js',
      '@solana/spl-token',
      '@walletconnect/ethereum-provider',
      '@walletconnect/time',
      '@walletconnect/relay-auth',
      '@walletconnect/core',
      '@walletconnect/utils'
    ],
    esbuildOptions: {
      target: 'esnext',
      define: {
        global: 'globalThis'
      }
    }
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      external: ['usb'],
      output: {
        globals: {
          buffer: 'Buffer'
        }
      }
    }
  },
  ssr: {
    noExternal: ['usb']
  }
}))
