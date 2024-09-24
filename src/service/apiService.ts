import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import { AuthService } from './authService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

class ApiService {
    private api: AxiosInstance;

    constructor(baseURL: string) {
        this.api = axios.create({
            baseURL,
            withCredentials: true,
        });
        this.api.interceptors.request.use(
            async (config) => {
                let token = AuthService.getAuthToken();
                if (token) {
                    if (!AuthService.isTokenValid(token)) {
                        try {
                            await AuthService.refreshAccessToken();
                            token = AuthService.getAuthToken();
                        } catch (error) {
                            AuthService.logout();
                            throw error;
                        }
                    }
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (error.response && error.response.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        await AuthService.refreshAccessToken();
                        const token = AuthService.getAuthToken();
                        if (token) {
                            originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        }
                        return this.api(originalRequest);
                    } catch (refreshError) {
                        AuthService.logout();
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );
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
            const response: AxiosResponse<T> = await this.api.get(endpoint, config);
            return response.data;
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

    public async authenticatedPost<T>(endpoint: string, data: any, config: AxiosRequestConfig = {}): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.api.post(endpoint, data, config);
            return response.data;
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

    public async authenticatedPut<T>(endpoint: string, data: any, config: AxiosRequestConfig = {}): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.api.put(endpoint, data, config);
            return response.data;
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

    public async authenticatedDelete<T>(endpoint: string, config: AxiosRequestConfig = {}): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.api.delete(endpoint, config);
            return response.data;
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

    public async get<T>(endpoint: string, config: AxiosRequestConfig = {}): Promise<T> {
        const response: AxiosResponse<T> = await this.api.get(endpoint, config);
        return response.data;
    }

    public async post<T>(endpoint: string, data: any, config: AxiosRequestConfig = {}): Promise<T> {
        const response: AxiosResponse<T> = await this.api.post(endpoint, data, config);
        return response.data;
    }
}

export const apiService = new ApiService(API_BASE_URL!!);
