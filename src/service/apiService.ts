import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import { AuthService } from "./authService";

class ApiService {
    private api: AxiosInstance;

    constructor(baseURL: string) {
        this.api = axios.create({
            baseURL,
            withCredentials: true,
        });
    }

    private createAuthConfig(config: AxiosRequestConfig = {}): AxiosRequestConfig {
        const token = AuthService.ensureValidToken();
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

    public async authenticatedPut<T>(endpoint: string, data: any, config: AxiosRequestConfig = {}): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.api.put(
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
