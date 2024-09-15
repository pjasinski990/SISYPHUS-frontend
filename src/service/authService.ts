import axios from 'axios';
import { apiService } from "./apiService";

interface AuthResponse {
    message: string;
    token: string | null;
    refreshToken: string | null;
}

export class AuthService {
    static TOKEN_TIMEOUT_DURATION = 1000;

    public async authRequest(endpoint: string, username: string, password: string): Promise<AuthResponse> {
        try {
            return await apiService.post<AuthResponse>(`http://localhost:8080${endpoint}`, {username, password});
        } catch (error) {
            this.handleAuthError(error)
        }
    }

    public login(username: string, password: string): Promise<AuthResponse> {
        return this.authRequest('/auth/login', username, password);
    }

    public register(username: string, password: string): Promise<AuthResponse> {
        return this.authRequest('/auth/register', username, password);
    }

    private handleAuthError(error: unknown): never {
        if (axios.isAxiosError(error) && error.response && error.response.data) {
            const data = error.response.data as { message?: string };
            const message = data.message || 'Unknown authentication error occurred';
            throw new Error(message);
        } else {
            console.error(`Unknown error occurred: ${error}`);
            throw new Error('An unknown error occurred during authentication.');
        }
    }

    static extractToken(response: AuthResponse): string {
        try {
            return response.token!
        } catch (error) {
            console.error(`Error extracting token from ${response}: ${error}`)
            throw error
        }
    }

    static extractRefreshToken(response: AuthResponse): string {
        try {
            return response.refreshToken!
        } catch (error) {
            console.error(`Error extracting refresh token from ${response}: ${error}`)
            throw error
        }
    }

    static waitForToken = (token: string): Promise<boolean> => {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const checkToken = () => {
                if (localStorage.getItem('authToken') === token) {
                    resolve(true);
                } else if (Date.now() - startTime > this.TOKEN_TIMEOUT_DURATION) {
                    resolve(false);
                } else {
                    setTimeout(checkToken, 100);
                }
            };
            checkToken();
        });
    };

    static getAuthToken(): string | null {
        return localStorage.getItem('authToken');
    }

    static isTokenValid(token: string): boolean {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = payload.exp * 1000;
            return Date.now() < expirationTime;
        } catch (error) {
            console.error('Error parsing token:', error);
            return false;
        }
    }

    public static async refreshAccessToken(): Promise<void> {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }
        try {
            const response = await axios.post<AuthResponse>('http://localhost:8080/auth/refresh', { refreshToken });
            const newToken = response.data.token;
            const newRefreshToken = response.data.refreshToken;
            if (!newToken) {
                throw new Error('No new access token returned');
            }
            localStorage.setItem('authToken', newToken);
            if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
            }
            window.dispatchEvent(
                new CustomEvent('tokenRefreshed', { detail: { token: newToken, refreshToken: newRefreshToken } })
            );
        } catch (error) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            window.dispatchEvent(new Event('authLogout'));
            throw error;
        }
    }

    public static logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        window.dispatchEvent(new Event('authLogout'));
    }
}

export const authService = new AuthService();
