import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';

class ApiService {
    private api: AxiosInstance;

    constructor(baseURL: string) {
        this.api = axios.create({
            baseURL,
            withCredentials: true,
        });
    }

    private getAuthToken(): string | null {
        return localStorage.getItem('authToken');
    }

    private isTokenValid(token: string): boolean {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = payload.exp * 1000; // Convert to milliseconds
            return Date.now() < expirationTime;
        } catch (error) {
            console.error('Error parsing token:', error);
            return false;
        }
    }

    private ensureValidToken(): string {
        const token = this.getAuthToken();
        if (!token) {
            throw new Error('No authentication token found');
        }
        if (!this.isTokenValid(token)) {
            throw new Error('Authentication token is expired or invalid');
        }
        return token;
    }

    private createAuthConfig(config: AxiosRequestConfig = {}): AxiosRequestConfig {
        const token = this.ensureValidToken();
        return {
            ...config,
            headers: {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            },
        };
    }

    handleAxiosError(error: unknown): never {
        if (axios.isAxiosError(error)) {
            console.error('Axios error:', error.message);
            if (error.response?.status === 401) {
                localStorage.removeItem('authToken');
                window.location.href = '/login';
            }
            throw new Error(`Request failed: ${error.message}`);
        } else {
            console.error('Unexpected error:', error);
            throw new Error('An unexpected error occurred');
        }
    }

    public async authenticatedGet<T>(endpoint: string, config: AxiosRequestConfig = {}): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.api.get(
                endpoint,
                this.createAuthConfig(config)
            );
            return response.data;
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

    public async authenticatedPost<T>(endpoint: string, data: any, config: AxiosRequestConfig = {}): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.api.post(
                endpoint,
                data,
                this.createAuthConfig(config)
            );
            return response.data;
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

    public async get<T>(endpoint: string, config: AxiosRequestConfig = {}): Promise<T> {
        const response: AxiosResponse<T> = await this.api.get(endpoint);
        return response.data;
    }

    public async post<T>(endpoint: string, data: any, config: AxiosRequestConfig = {}): Promise<T> {
        const response: AxiosResponse<T> = await this.api.post(endpoint, data, config);
        return response.data;
    }
}

export const apiService = new ApiService('http://localhost:8080');