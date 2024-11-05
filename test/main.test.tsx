import React from 'react';
import { screen } from '@testing-library/react';
import { customRender } from './utils/customRender';
import App from '../src/App';

describe('entry point', () => {
    it('renders without crashing and displays login page', () => {
        const authOptions = { isAuthenticated: false };

        customRender(
            <App />,
            { authValue: authOptions }
        );

        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });
});
