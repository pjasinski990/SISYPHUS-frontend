import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { Input } from "src/components/ui/input";
import { Button } from "src/components/ui/button";
import { Alert, AlertDescription } from "src/components/ui/alert";
import Layout from "src/components/Layout";
import { login, register } from "src/services/auth";

const LoginPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = isLogin
                ? await login(username, password)
                : await register(username, password);

            setMessage(response.success
                ? `Success! ${response.message}`
                : `Error: ${response.message}`);
        } catch (error) {
            console.error(error);
            setMessage('An error occurred. Please try again.');
        }
    };

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
