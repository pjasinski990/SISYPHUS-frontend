import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from "src/components/Layout";
import { useAuth } from "src/context/AuthContext";
import { dailyPlanService, DailyPlanService } from "../service/dailyPlan";
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

interface DailyPlan {
    id: string;
    ownerUsername: string;
    day: string;
    todo: Task[];
    done: Task[];
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
                    <p className="mb-4">Welcome to your dashboard!</p>
                    {dailyPlan ? (
                        <div>
                            <h2 className="text-xl font-semibold mb-2">Daily Plan for {dailyPlan.day}</h2>
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold">To Do:</h3>
                                <ul>
                                    {dailyPlan.todo.map((task) => (
                                        <li key={task.id} className="mb-2">
                                            <span className="font-medium">{task.description}</span> -
                                            {task.startTime} ({task.category}, {task.size})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Done:</h3>
                                <ul>
                                    {dailyPlan.done.map((task) => (
                                        <li key={task.id} className="mb-2">
                                            <span className="font-medium">{task.description}</span> -
                                            {task.startTime} ({task.category}, {task.size})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <p>Loading daily plan...</p>
                    )}
                    <Button onClick={handleLogout} className="w-full mt-4">
                        Logout
                    </Button>
                </CardContent>
            </Card>
        </Layout>
    );
};

export default Dashboard;
