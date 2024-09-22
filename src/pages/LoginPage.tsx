import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { Input } from "src/components/ui/input";
import { Button } from "src/components/ui/button";
import { Alert, AlertDescription } from "src/components/ui/alert";
import Layout from "src/components/Layout";
import { useAuth } from "src/components/context/AuthContext";
import { AuthResponse, AuthService, authService } from "../service/authService";

const LoginPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const { setToken, setRefreshToken } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = isLogin
                ? await authService.login(username, password)
                : await authService.register(username, password);

            if (isLogin) {
                await handleSuccessfulLoginResponse(response);
            } else {
                await handleSuccessfulRegisterResponse(response);
            }
        } catch (error) {
            if (error instanceof Error) {
                setMessage(`Error: ${error.message}`);
            } else {
                setMessage('An unexpected error occurred.');
            }
        }
    };

    const handleSuccessfulLoginResponse = async (response: AuthResponse) => {
        const token = AuthService.extractToken(response);
        const refreshToken = AuthService.extractRefreshToken(response);
        setToken(token);
        setRefreshToken(refreshToken);
        const tokenSet = await AuthService.waitForToken(token)
        if (tokenSet) {
            navigate('/dashboard');
        }
        else {
            setMessage(`Error logging in. Try again later.`)
        }
    }

    const handleSuccessfulRegisterResponse = async (response: AuthResponse) => {
        setMessage(`${response.message}. Redirecting to login.`)
        setTimeout(() => {
            setIsLogin(true)
            setMessage('')
        }, 1000)
    }

    const toggleAuthMode = () => setIsLogin(!isLogin);

    return (
        <Layout>
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>{isLogin ? 'Login' : 'Register'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Button type="submit" className="w-full">
                            {isLogin ? 'Login' : 'Register'}
                        </Button>
                    </form>
                    <div className="mt-4 text-center">
                        <Button
                            variant="link"
                            onClick={toggleAuthMode}
                            className="text-sm"
                        >
                            {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
                        </Button>
                    </div>
                    {message && (
                        <Alert className="mt-4">
                            <AlertDescription>{message}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </Layout>
    );
};

export default LoginPage;
