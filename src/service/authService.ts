import axios, { AxiosError } from 'axios';
import { apiService } from "./apiService";

interface AuthResponse {
    message: string;
    token: string | null;
}

export class AuthService {
    static TOKEN_TIMEOUT_DURATION = 1000;

    public async authRequest(endpoint: string, username: string, password: string): Promise<AuthResponse> {
        try {
            return await apiService.post<AuthResponse>(`http://localhost:8080${endpoint}`, { username, password });
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
            return response.token!!
        }
        catch (error) {
            console.error(`Error extracting token from ${response}: ${error}`)
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

    static ensureValidToken(): string {
        const token = this.getAuthToken();
        if (!token) {
            throw new Error('No authentication token found');
        }
        if (!this.isTokenValid(token)) {
            localStorage.removeItem('authToken');
            throw new Error('Authentication token is expired or invalid. Removed invalid token.');
        }
        return token;
    }

    private buildResponseFromAuthError(error: unknown) {
        if (error instanceof AxiosError) {
            if (error.response && error.response.data) {
                return error.response.data as AuthResponse;
            } else {
                console.log(`Unknown axios error occurred: ${error}`)
                throw error;
            }
        } else {
            console.log(`Unknown error occurred: ${error}`)
            throw error;
        }
    }
}

export const authService = new AuthService();
