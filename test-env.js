// 测试环境变量加载
import { loadEnv } from 'vite';

// 测试开发模式
const devEnv = loadEnv('development', '.', '');
console.log('Development environment variables:');
console.log('VITE_ARK_API_KEY:', devEnv.VITE_ARK_API_KEY ? '***' : 'undefined');
console.log('VITE_IMGBB_API_KEY:', devEnv.VITE_IMGBB_API_KEY ? '***' : 'undefined');

// 测试生产模式
const prodEnv = loadEnv('production', '.', '');
console.log('\nProduction environment variables:');
console.log('VITE_ARK_API_KEY:', prodEnv.VITE_ARK_API_KEY ? '***' : 'undefined');
console.log('VITE_IMGBB_API_KEY:', prodEnv.VITE_IMGBB_API_KEY ? '***' : 'undefined');
