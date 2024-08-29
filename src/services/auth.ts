interface AuthResponse {
    success: boolean;
    message: string;
    token: string | null;
}

async function authRequest(endpoint: string, username: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    return response.json();
}

export const login = (username: string, password: string) => authRequest('/auth/login', username, password);
export const register = (username: string, password: string) => authRequest('/auth/register', username, password);
