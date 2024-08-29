import React, { createContext, useState, useContext, useEffect } from 'react';

interface AuthContextType {
    token: string | null;
    setToken: (token: string | null) => void;
    logout: () => void;
    isAuthenticated: boolean;
    username: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const extractUsernameFromToken = (token: string): string | null => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(jsonPayload);
            return payload.sub || null;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    };

    const [token, setTokenState] = useState<string | null>(() => {
        return localStorage.getItem('authToken');
    });

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

    const setToken = (newToken: string | null) => {
        setTokenState(newToken);
    };

    const logout = () => {
        setTokenState(null);
        setUsername(null);
        localStorage.removeItem('authToken');
    };

    return (
        <AuthContext.Provider value={{ token, setToken, logout, isAuthenticated, username }}>
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
