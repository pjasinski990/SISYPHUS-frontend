import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardContent, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import Layout from '../components/Layout';

const ProfilePage: React.FC = () => {
    const { username, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <Layout>
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>User Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">Username: {username}</p>
                    <p className="mb-4">Hello, {username} 🫡</p>
                    <Button onClick={handleLogout} className="w-full">Logout</Button>
                </CardContent>
            </Card>
        </Layout>
    );
};

export default ProfilePage;
