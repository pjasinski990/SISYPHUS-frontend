import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from "src/components/Layout";
import { useAuth } from "src/context/AuthContext";
import { DailyPlan, DailyPlanService, dailyPlanService } from "../service/dailyPlanService";
import { DailyPlanComponent, DailyPlanContent } from "src/components/DailyPlanComponent";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { Button } from "src/components/ui/button";

interface Task {
    id: string;
    ownerUsername: string;
    category: string;
    size: string;
    description: string;
    startTime: string;
}

const Dashboard: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);

    useEffect(() => {
        const fetchDailyPlan = async () => {
            const date = DailyPlanService.formatToIsoDate(new Date());
            try {
                const data = await dailyPlanService.getDailyPlan(date);
                setDailyPlan(data.plan);
            } catch (error) {
                console.error('Error fetching daily plan:', error);
            }
        };

        fetchDailyPlan();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Layout>
            <Card className="w-full max-w-3xl">
                <CardHeader>
                    <CardTitle>Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <DailyPlanComponent dailyPlan={dailyPlan} onLogout={handleLogout} />
                </CardContent>
            </Card>
        </Layout>
    );
};

export default Dashboard;
