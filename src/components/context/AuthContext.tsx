import React, { createContext, useState, useContext, useEffect } from 'react';

export interface AuthContextType {
    token: string | null;
    setToken: (token: string | null) => void;
    refreshToken: string | null;
    setRefreshToken: (refreshToken: string | null) => void;
    logout: () => void;
    isAuthenticated: boolean;
    username: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [token, setToken] = useState<string | null>(() =>
        localStorage.getItem('authToken')
    );
    const [refreshToken, setRefreshToken] = useState<string | null>(() =>
        localStorage.getItem('refreshToken')
    );
    const [username, setUsername] = useState<string | null>(() => {
        const storedToken = localStorage.getItem('authToken');
        return storedToken ? extractUsernameFromToken(storedToken) : null;
    });

    const isAuthenticated = !!token;

    useEffect(() => {
        if (token) {
            localStorage.setItem('authToken', token);
            const extractedUsername = extractUsernameFromToken(token);
            setUsername(extractedUsername);
        } else {
            localStorage.removeItem('authToken');
            setUsername(null);
        }
    }, [token]);

    useEffect(() => {
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        } else {
            localStorage.removeItem('refreshToken');
        }
    }, [refreshToken]);

    function extractUsernameFromToken(token: string): string | null {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(function (c) {
                        return (
                            '%' +
                            ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                        );
                    })
                    .join('')
            );

            const payload = JSON.parse(jsonPayload);
            return payload.sub || null;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }

    useEffect(() => {
        const handleTokenRefreshed = (event: CustomEvent) => {
            const { token: newToken, refreshToken: newRefreshToken } =
                event.detail;
            setToken(newToken);
            setUsername(newToken ? extractUsernameFromToken(newToken) : null);
            if (newRefreshToken) {
                setRefreshToken(newRefreshToken);
            }
        };

        const handleLogout = () => {
            setToken(null);
            setRefreshToken(null);
            setUsername(null);
        };

        window.addEventListener(
            'tokenRefreshed',
            handleTokenRefreshed as EventListener
        );
        window.addEventListener('authLogout', handleLogout);

        return () => {
            window.removeEventListener(
                'tokenRefreshed',
                handleTokenRefreshed as EventListener
            );
            window.removeEventListener('authLogout', handleLogout);
        };
    }, []);

    const logout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
        setRefreshToken(null);
        setUsername(null);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                setToken,
                refreshToken,
                setRefreshToken,
                logout,
                isAuthenticated,
                username,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
