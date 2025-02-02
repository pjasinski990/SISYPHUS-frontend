import axios, {
    AxiosInstance,
    AxiosResponse,
    AxiosError,
    InternalAxiosRequestConfig,
} from 'axios';
import { authService } from './authService';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

class ApiService {
    private readonly api: AxiosInstance;

    constructor(baseURL: string) {
        this.api = axios.create({
            baseURL,
            withCredentials: true,
        });
        this.initializeInterceptors();
    }

    private initializeInterceptors() {
        this.api.interceptors.request.use(
            async (config: InternalAxiosRequestConfig) => {
                let token = authService.getAuthToken();
                if (token) {
                    if (!authService.isTokenValid(token)) {
                        try {
                            await authService.refreshAccessToken();
                            token = authService.getAuthToken();
                        } catch (error) {
                            authService.logout();
                            throw error;
                        }
                    }
                    config.headers = config.headers || {};
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.api.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as CustomAxiosRequestConfig;
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        await authService.refreshAccessToken();
                        const token = authService.getAuthToken();
                        if (token) {
                            originalRequest.headers = originalRequest.headers || {};
                            originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        }
                        return this.api(originalRequest);
                    } catch (refreshError) {
                        authService.logout();
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    private handleAxiosError(error: unknown): never {
        if (axios.isAxiosError(error)) {
            console.error('Axios error:', error.message);
            throw new Error(`Request failed: ${error.message}`);
        } else {
            console.error('Unexpected error:', error);
            throw new Error('An unexpected error occurred');
        }
    }

    private async requestWrapper<T>(
        requestFn: () => Promise<AxiosResponse<T>>
    ): Promise<T> {
        try {
            const response = await requestFn();
            return response.data;
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

    public authenticatedGet<T>(
        endpoint: string,
        config: Record<string, unknown> = {}
    ): Promise<T> {
        return this.requestWrapper(() => this.api.get<T>(endpoint, config));
    }

    public authenticatedPost<T>(
        endpoint: string,
        data: object,
        config: Record<string, unknown> = {}
    ): Promise<T> {
        return this.requestWrapper(() => this.api.post<T>(endpoint, data, config));
    }

    public authenticatedPut<T>(
        endpoint: string,
        data: object,
        config: Record<string, unknown> = {}
    ): Promise<T> {
        return this.requestWrapper(() => this.api.put<T>(endpoint, data, config));
    }

    public authenticatedDelete<T>(
        endpoint: string,
        config: Record<string, unknown> = {}
    ): Promise<T> {
        return this.requestWrapper(() => this.api.delete<T>(endpoint, config));
    }

    public get<T>(
        endpoint: string,
        config: Record<string, unknown> = {}
    ): Promise<T> {
        return this.requestWrapper(() => this.api.get<T>(endpoint, config));
    }

    public post<T>(
        endpoint: string,
        data: object,
        config: Record<string, unknown> = {}
    ): Promise<T> {
        return this.requestWrapper(() => this.api.post<T>(endpoint, data, config));
    }
}

export const apiService = new ApiService(
    import.meta.env.VITE_SISYPHUS_BACKEND_HOSTNAME ?? ""
);
