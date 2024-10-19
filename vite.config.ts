import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import eslintPlugin from 'vite-plugin-eslint';

export default defineConfig({
    plugins: [
        react(),
        eslintPlugin({
            failOnError: true,
            failOnWarning: true,
            include: ['src/**/*.js', 'src/**/*.jsx', 'src/**/*.ts', 'src/**/*.tsx'],
            exclude: ['node_modules', 'dist', 'src/components/ui/**'],
            overrideConfigFile: path.resolve(__dirname, '.eslintrc.cjs'),
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
