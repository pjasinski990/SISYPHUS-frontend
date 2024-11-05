import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../../src/components/context/AuthContext';

describe('AuthProvider', () => {
    let localStorageMock: Record<string, string>;

    beforeEach(() => {
        localStorageMock = {};
        vi.stubGlobal('localStorage', {
            getItem: (key: string) => {
                return localStorageMock[key] || null;
            },
            setItem: (key: string, value: string) => {
                localStorageMock[key] = value;
            },
            removeItem: (key: string) => {
                delete localStorageMock[key];
            },
            clear: () => {
                localStorageMock = {};
            }
        });

        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
    );

    it('should initialize with tokens from localStorage', () => {
        localStorageMock['authToken'] = 'dummyToken';
        localStorageMock['refreshToken'] = 'dummyRefreshToken';

        const { result } = renderHook(() => useAuth(), { wrapper });

        expect(result.current.token).toBe('dummyToken');
        expect(result.current.refreshToken).toBe('dummyRefreshToken');
        expect(result.current.isAuthenticated).toBe(true);
    });

    it('should update token and localStorage when setToken is called', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        act(() => {
            result.current.setToken('newToken');
        });

        expect(result.current.token).toBe('newToken');
        expect(localStorageMock['authToken']).toBe('newToken');
    });

    it('should update refreshToken and localStorage when setRefreshToken is called', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        act(() => {
            result.current.setRefreshToken('newRefreshToken');
        });

        expect(result.current.refreshToken).toBe('newRefreshToken');
        expect(localStorageMock['refreshToken']).toBe('newRefreshToken');
    });

    it('should extract username from token', () => {
        const dummyToken =
            'header.' +
            btoa(JSON.stringify({ sub: 'testUser' })) +
            '.signature';

        const { result } = renderHook(() => useAuth(), { wrapper });

        act(() => {
            result.current.setToken(dummyToken);
        });

        expect(result.current.username).toBe('testUser');
    });

    it('should handle invalid token gracefully', () => {
        const invalidToken = 'invalid.token.value';

        const { result } = renderHook(() => useAuth(), { wrapper });

        act(() => {
            result.current.setToken(invalidToken);
        });

        expect(result.current.username).toBeNull();
        expect(console.error).toHaveBeenCalled();
    });

    it('should logout correctly', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        act(() => {
            result.current.setToken('tokenToRemove');
            result.current.setRefreshToken('refreshTokenToRemove');
        });

        act(() => {
            result.current.logout();
        });

        expect(result.current.token).toBeNull();
        expect(result.current.refreshToken).toBeNull();
        expect(result.current.username).toBeNull();
        expect(localStorageMock['authToken']).toBeUndefined();
        expect(localStorageMock['refreshToken']).toBeUndefined();
    });

    it('should handle tokenRefreshed event', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        act(() => {
            window.dispatchEvent(
                new CustomEvent('tokenRefreshed', {
                    detail: { token: 'newToken', refreshToken: 'newRefreshToken' },
                })
            );
        });

        expect(result.current.token).toBe('newToken');
        expect(result.current.refreshToken).toBe('newRefreshToken');
        expect(localStorageMock['authToken']).toBe('newToken');
        expect(localStorageMock['refreshToken']).toBe('newRefreshToken');
    });

    it('should handle authLogout event', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        act(() => {
            result.current.setToken('tokenToRemove');
            result.current.setRefreshToken('refreshTokenToRemove');
        });

        act(() => {
            window.dispatchEvent(new Event('authLogout'));
        });

        expect(result.current.token).toBeNull();
        expect(result.current.refreshToken).toBeNull();
        expect(localStorageMock['authToken']).toBeUndefined();
        expect(localStorageMock['refreshToken']).toBeUndefined();
    });

    it('should throw error if useAuth is used outside AuthProvider', () => {
        expect(() => renderHook(() => useAuth())).toThrow(
            new Error('useAuth must be used within an AuthProvider')
        );
    });
});
