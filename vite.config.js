import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Alias for handling '@/' imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Your build configuration
  build: {
    sourcemap: false,
  },
});

// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import path from 'path';

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],

//   // Alias for handling '@/' imports
//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, './src'),
//     },
//   },

//   // Your build configuration
//   build: {
//     sourcemap: false,
//   },
// });

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import path from 'path'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],

//   // Alias for handling '@/'
//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, './src'),
//     },
//   },

//   // Dev server proxy
//   // server: {
//   //   proxy: {
//   //     '/api': {
//   //       target: 'http://18.232.180.195:5000',
//   //       changeOrigin: true,
//   //       secure: false,
//   //     },
//   //   },
//   // },

//   // Build config
//   build: {
//     sourcemap: false,
//   },
// })
