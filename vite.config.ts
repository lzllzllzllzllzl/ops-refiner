import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  console.log('Loaded environment variables:', {
    VITE_ARK_API_KEY: env.VITE_ARK_API_KEY ? '***' : 'undefined',
    VITE_IMGBB_API_KEY: env.VITE_IMGBB_API_KEY ? '***' : 'undefined',
    ARK_API_KEY: env.ARK_API_KEY ? '***' : 'undefined',
    IMGBB_API_KEY: env.IMGBB_API_KEY ? '***' : 'undefined'
  });

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    define: {
      'process.env': JSON.stringify(env),
    },
  };
});
