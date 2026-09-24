import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ตั้งค่า Vite ให้แปลง JSX และรองรับ React
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': 'http://localhost:5000' },
  },
});
