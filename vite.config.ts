// Force rebuild - import { defineConfig, loadEnv } from 'vite';
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

  // 在 Vercel 部署时，需要确保环境变量能正确地暴露给客户端
  // 对于 Vite 项目，使用 VITE_ 前缀的环境变量会自动暴露
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
    // 确保 Vite 能正确地处理环境变量
    define: {
      'process.env': JSON.stringify(env),
    },
  };
});
