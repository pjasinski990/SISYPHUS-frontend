import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
    plugins: [
        react({
            fastRefresh: true,
        }),
    ],
    server: {
        port: 3000,
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.js',
    },
    resolve: {
        alias: {
            'src': path.resolve(__dirname, './src'),
        },
    }
});
