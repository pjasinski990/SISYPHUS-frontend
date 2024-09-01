import { AxiosError } from 'axios';
import { apiService } from "src/lib/api";

interface AuthResponse {
    message: string;
    success: boolean;
    token: string | null;
}

export class AuthService {
    public async authRequest(endpoint: string, username: string, password: string): Promise<AuthResponse> {
        try {
            console.log('calling auth request');
            return await apiService.post<AuthResponse>(`http://localhost:8080${endpoint}`, { username, password });
        } catch (error) {
            return this.buildResponseFromAuthError(error)
        }
    }

    public login(username: string, password: string): Promise<AuthResponse> {
        return this.authRequest('/auth/login', username, password);
    }

    public register(username: string, password: string): Promise<AuthResponse> {
        return this.authRequest('/auth/register', username, password);
    }

    private buildResponseFromAuthError(error: unknown) {
        console.log('erorrs fdlasdkjflasdjfasdlkfj')
        if (error instanceof AxiosError) {
            if (error.response && error.response.data) {
                console.log(error.response.data)
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
