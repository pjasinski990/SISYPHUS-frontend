import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { Button } from "src/components/ui/button";
import Layout from "src/components/Layout";
import { useAuth } from "src/context/AuthContext";
import {formatToIsoDate, getDailyPlan} from "src/lib/dailyPlan";

const Dashboard: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const date = formatToIsoDate(new Date());
    getDailyPlan(date)
        .then(data => console.log(data.plan))
        .catch(error => console.error('Error:', error));

    return (
        <Layout>
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">Welcome to your dashboard!</p>
                    <Button onClick={handleLogout} className="w-full">
                        Logout
                    </Button>
                </CardContent>
            </Card>
        </Layout>
    );
};

export default Dashboard;
