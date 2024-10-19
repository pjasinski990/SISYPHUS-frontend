import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import eslintPlugin from 'vite-plugin-eslint';

export default defineConfig({
    plugins: [
        react(),
        eslintPlugin({
            failOnError: false,
            failOnWarning: false,
            include: ['src/**/*.js', 'src/**/*.jsx', 'src/**/*.ts', 'src/**/*.tsx'],
            exclude: ['node_modules', 'dist', 'src/components/ui/**'],
        }),
    ],
    server: {
        port: 3000,
    },
    resolve: {
        alias: {
            'src': path.resolve(__dirname, './src'),
        },
    },
});
