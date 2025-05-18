import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.example.streaminghttp',
    appName: 'example',
    webDir: 'out', // 正式版本时候打开
    ios: {},
    server: {
        url: 'http://127.0.0.1:3000', //正式版本时候需要注释掉
    },
};

export default config;
