import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { Input } from "src/components/ui/input";
import { Button } from "src/components/ui/button";
import { Alert, AlertDescription } from "src/components/ui/alert";
import { Moon, Sun } from "lucide-react";

interface AuthResponse {
    success: boolean;
    message: string;
}

const LoginPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [darkMode, setDarkMode] = useState(true);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const endpoint = isLogin ? '/auth/login' : '/auth/register';

        try {
            const response = await fetch(`http://localhost:8080${endpoint}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: username, password: password }),
            });

            const data: AuthResponse = await response.json();
            console.log(data)

            if (data.success) {
                setMessage(`Success! ${data.message}`);
            } else {
                setMessage(`Error: ${data.message}`);
            }
        } catch (error) {
            console.log(error);
            setMessage('An error occurred. Please try again.');
        }
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4"
                onClick={toggleDarkMode}
            >
                {darkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
                <span className="sr-only">Toggle theme</span>
            </Button>
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
                            onClick={() => setIsLogin(!isLogin)}
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
        </div>
    );
};

export default LoginPage;