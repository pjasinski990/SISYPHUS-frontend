import axios from 'axios';
import { apiService } from './apiService';

export interface AuthResponse {
    message: string;
    token: string | null;
    refreshToken: string | null;
}

export class AuthService {
    private refreshingPromise: Promise<void> | null = null;
    private static TOKEN_TIMEOUT_DURATION = 1000;

    async refreshRequest(refreshToken: string | null): Promise<AuthResponse> {
        try {
            console.log('Refreshing token...');
            return await apiService.post<AuthResponse>('/auth/refresh', { refreshToken });
        } catch (error) {
            this.handleAuthError(error);
        }
    }

    async authRequest(
        endpoint: string,
        username: string,
        password: string
    ): Promise<AuthResponse> {
        try {
            return await apiService.post<AuthResponse>(endpoint, { username, password });
        } catch (error) {
            this.handleAuthError(error);
        }
    }

    login(username: string, password: string): Promise<AuthResponse> {
        return this.authRequest('/auth/login', username, password);
    }

    register(username: string, password: string): Promise<AuthResponse> {
        return this.authRequest('/auth/register', username, password);
    }

    private handleAuthError(error: unknown): never {
        if (axios.isAxiosError(error) && error.response?.data) {
            const data = error.response.data as { message?: string };
            const message = data.message || 'Unknown authentication error occurred';
            throw new Error(message);
        } else {
            console.error('Unknown error occurred:', error);
            throw new Error('An unknown error occurred during authentication.');
        }
    }

    getAuthToken(): string | null {
        return localStorage.getItem('authToken');
    }

    isTokenValid(token: string): boolean {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = payload.exp * 1000;
            return Date.now() < expirationTime;
        } catch (error) {
            console.error('Error parsing token:', error);
            return false;
        }
    }

    async refreshAccessToken(): Promise<void> {
        if (this.refreshingPromise) {
            return this.refreshingPromise;
        }

        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        this.refreshingPromise = (async () => {
            try {
                const response = await this.refreshRequest(refreshToken);
                const newToken = response.token;
                const newRefreshToken = response.refreshToken;
                if (!newToken) {
                    throw new Error('No new access token returned');
                }
                localStorage.setItem('authToken', newToken);
                if (newRefreshToken) {
                    localStorage.setItem('refreshToken', newRefreshToken);
                }
                window.dispatchEvent(
                    new CustomEvent('tokenRefreshed', {
                        detail: { token: newToken, refreshToken: newRefreshToken },
                    })
                );
            } catch (error) {
                this.logout();
                throw error;
            } finally {
                this.refreshingPromise = null;
            }
        })();

        return this.refreshingPromise;
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        window.dispatchEvent(new Event('authLogout'));
    }

    static waitForToken(token: string): Promise<boolean> {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const checkToken = () => {
                if (localStorage.getItem('authToken') === token) {
                    resolve(true);
                } else if (Date.now() - startTime > AuthService.TOKEN_TIMEOUT_DURATION) {
                    resolve(false);
                } else {
                    setTimeout(checkToken, 100);
                }
            };
            checkToken();
        });
    }
}

export const authService = new AuthService();
