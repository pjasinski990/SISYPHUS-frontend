import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { fireEvent, screen, customRender } from '../utils/customRender';
import Navigation from '../../src/components/Navigation';
import { LinkProps, useNavigate } from 'react-router-dom';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
        Link: ({ children, to, ...props }: LinkProps) => (
            <a href={typeof to === 'string' ? to : '/'} {...props}>
                {children}
            </a>
        ),
    };
});

const mockedUseNavigate = vi.mocked(useNavigate);

describe('Navigation Component', () => {
    const mockLogout = vi.fn();
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.resetAllMocks();
        mockedUseNavigate.mockReturnValue(mockNavigate);
    });

    const renderNavigation = (
        isAuthenticated: boolean,
        username = 'JohnDoe',
        darkMode = false,
        toggleDarkMode = vi.fn(),
        shortcutsValue = {}
    ) => {
        customRender(
            <Navigation darkMode={darkMode} toggleDarkMode={toggleDarkMode} />,
            {
                authValue: {
                    isAuthenticated,
                    username,
                    logout: mockLogout,
                },
                shortcutsValue,
            }
        );
    };

    it('renders correctly when user is authenticated', () => {
        renderNavigation(true, 'JaneDoe');

        expect(screen.getByText('JaneDoe')).toBeInTheDocument();
        expect(screen.getByText('Stats')).toBeInTheDocument();
        expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('does not render authenticated elements when user is not authenticated', () => {
        renderNavigation(false);

        expect(screen.queryByText('Stats')).not.toBeInTheDocument();
        expect(screen.queryByText('Logout')).not.toBeInTheDocument();
        expect(screen.queryByText(/JaneDoe|JohnDoe/)).not.toBeInTheDocument();

        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
        expect(screen.getByText('SISYPHUS')).toBeInTheDocument();
    });

    it('calls toggleDarkMode when dark mode button is clicked', () => {
        const toggleDarkMode = vi.fn();
        renderNavigation(false, '', false, toggleDarkMode);

        const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
        fireEvent.click(toggleButton);

        expect(toggleDarkMode).toHaveBeenCalledTimes(1);
    });

    it('displays Sun icon when darkMode is true', () => {
        renderNavigation(false, '', true);

        expect(screen.getByTestId('SunIcon')).toBeInTheDocument();
    });

    it('displays Moon icon when darkMode is false', () => {
        renderNavigation(false, '', false);

        expect(screen.getByTestId('MoonIcon')).toBeInTheDocument();
    });

    it('handles logout correctly', () => {
        renderNavigation(true, 'JaneDoe');

        const logoutButton = screen.getByText('Logout');
        fireEvent.click(logoutButton);

        expect(mockLogout).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('renders ShortcutsInfoDialog component', () => {
        renderNavigation(false);

        expect(screen.getByRole('button', { name: /shortcuts info/i })).toBeInTheDocument();
    });

    it('navigates to profile when Profile link is clicked', () => {
        renderNavigation(true, 'JaneDoe');

        const profileLink = screen.getByText('JaneDoe').closest('a');
        expect(profileLink).toHaveAttribute('href', '/profile');
    });

    it('navigates to stats when Stats link is clicked', () => {
        renderNavigation(true, 'JaneDoe');

        const statsLink = screen.getByText('Stats').closest('a');
        expect(statsLink).toHaveAttribute('href', '/stats');
    });
});
