import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables based on mode
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      hmr: {
        overlay: false // Disable error overlay
      },
      watch: {
        usePolling: true,
        interval: 100
      }
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
      minify: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui': ['lucide-react'],
            'supabase': ['@supabase/supabase-js']
          }
        }
      }
    },
    // Properly define env variables
    define: {
      __SUPABASE_URL__: JSON.stringify(env.VITE_SUPABASE_URL || ''),
      __SUPABASE_ANON_KEY__: JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
      __STRIPE_PUBLIC_KEY__: JSON.stringify(env.VITE_STRIPE_PUBLIC_KEY || ''),
      __SITE_URL__: JSON.stringify(env.VITE_SITE_URL || ''),
      __APP_NAME__: JSON.stringify(env.VITE_APP_NAME || ''),
      __APPLE_SERVICES_ID__: JSON.stringify(env.VITE_APPLE_SERVICES_ID || '')
    }
  };
});