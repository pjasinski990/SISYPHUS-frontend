import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './vitest.setup.ts',
        include: ['test/**/*.test.{ts,tsx}', 'componentTest/**/*.test.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            reportsDirectory: './coverage',
            reporter: ['text', 'json', 'html'],
            all: true,
            include: ['src/**/*.{ts,tsx}'],
        },
    },
    resolve: {
        alias: {
            'src': path.resolve(__dirname, './src'),
        },
    },
});
