import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../src/App';
import { customRender } from './utils/customRender';

describe('App Routing', () => {
    it('should render the login page for unauthenticated users accessing /login', () => {
        const authOptions = { isAuthenticated: false };

        customRender(
            <MemoryRouter initialEntries={['/login']}>
                <AppRoutes />
            </MemoryRouter>,
            { authValue: authOptions }
        );

        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });

    it('should redirect unauthenticated users accessing protected routes to /login', () => {
        const authOptions = { isAuthenticated: false };

        customRender(
            <MemoryRouter initialEntries={['/dashboard']}>
                <AppRoutes />
            </MemoryRouter>,
            { authValue: authOptions }
        );

        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });

    it('should render the dashboard page for authenticated users accessing /dashboard', () => {
        const authOptions = { isAuthenticated: true };

        customRender(
            <MemoryRouter initialEntries={['/dashboard']}>
                <AppRoutes />
            </MemoryRouter>,
            { authValue: authOptions }
        );

        expect(screen.getByRole('heading', { name: /today/i })).toBeInTheDocument();
    });

    it('should redirect authenticated users accessing /login to /dashboard', () => {
        const authOptions = { isAuthenticated: true };

        customRender(
            <MemoryRouter initialEntries={['/login']}>
                <AppRoutes />
            </MemoryRouter>,
            { authValue: authOptions }
        );

        expect(screen.getByRole('heading', { name: /today/i })).toBeInTheDocument();
    });

    it('should navigate to the profile page for authenticated users', () => {
        const authOptions = { isAuthenticated: true };

        customRender(
            <MemoryRouter initialEntries={['/profile']}>
                <AppRoutes />
            </MemoryRouter>,
            { authValue: authOptions }
        );

        expect(screen.getByRole('heading', { name: /profile/i })).toBeInTheDocument();
    });

    it('should render the stats page for authenticated users', () => {
        const authOptions = { isAuthenticated: true };

        customRender(
            <MemoryRouter initialEntries={['/stats']}>
                <AppRoutes />
            </MemoryRouter>,
            { authValue: authOptions }
        );

        expect(screen.getByRole('heading', { name: /task statistics/i })).toBeInTheDocument();
    });

    it('should redirect to /login for unauthenticated users accessing /stats', () => {
        const authOptions = { isAuthenticated: false };

        customRender(
            <MemoryRouter initialEntries={['/stats']}>
                <AppRoutes />
            </MemoryRouter>,
            { authValue: authOptions }
        );

        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });

    it('should redirect to the appropriate route when navigating to "/" based on authentication status', () => {
        const authOptionsAuthenticated = { isAuthenticated: true };

        customRender(
            <MemoryRouter initialEntries={['/']}>
                <AppRoutes />
            </MemoryRouter>,
            { authValue: authOptionsAuthenticated }
        );

        expect(screen.getByRole('heading', { name: /today/i })).toBeInTheDocument();

        const authOptionsUnauthenticated = { isAuthenticated: false };

        customRender(
            <MemoryRouter initialEntries={['/']}>
                <AppRoutes />
            </MemoryRouter>,
            { authValue: authOptionsUnauthenticated }
        );

        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });
});
