import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This ensures process.env is available for the API key in the browser environment if needed,
    // though usually handled by .env files in Vite.
    'process.env': process.env
  }
});