import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import Layout from '../components/Layout';

const ProfilePage: React.FC = () => {
    const { username } = useAuth();

    return (
        <Layout>
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>User Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">Username: {username}</p>
                    <p className="mb-4">Hello, {username} 🫡</p>
                </CardContent>
            </Card>
        </Layout>
    );
};

export default ProfilePage;
