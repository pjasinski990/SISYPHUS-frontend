import React, { ReactNode } from 'react';
import { AuthContext, AuthContextType } from 'src/components/context/AuthContext';
import { vi } from 'vitest';

interface MockAuthProviderProps {
    children: ReactNode;
    value?: Partial<AuthContextType>;
}

export const MockAuthProvider: React.FC<MockAuthProviderProps> = ({ children, value = {} }) => {
    const defaultValue: AuthContextType = {
        token: 'mockToken',
        setToken: vi.fn(),
        refreshToken: 'mockRefreshToken',
        setRefreshToken: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: false,
        username: null,
        ...value,
    };

    return <AuthContext.Provider value={defaultValue}>{children}</AuthContext.Provider>;
};
