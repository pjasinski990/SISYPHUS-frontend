import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from "src/components/Layout";
import { useAuth } from "src/context/AuthContext";
import { DailyPlan, DailyPlanService, dailyPlanService } from "../service/dailyPlanService";
import { DailyPlanComponent } from "src/components/DailyPlanComponent";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { DropResult } from "react-beautiful-dnd";

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

        fetchDailyPlan().then(r => console.log(r));
    }, []);

    const onDragEnd = (result: DropResult) => {
        console.log(result);
        const { source, destination } = result;
        if (!dailyPlan || !destination) {
            return;
        }

        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return;
        }

        const newDailyPlan: DailyPlan = { ...dailyPlan };

        const sourceList = source.droppableId === 'todo' ? newDailyPlan.todo : newDailyPlan.done;
        const destList = destination.droppableId === 'todo' ? newDailyPlan.todo : newDailyPlan.done;

        if (sourceList && destList) {
            const [movedTask] = sourceList.splice(source.index, 1);
            destList.splice(destination.index, 0, movedTask);
            setDailyPlan(newDailyPlan);
        }
    };

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
                    <DailyPlanComponent dailyPlan={dailyPlan} onLogout={handleLogout} onTaskMove={onDragEnd}/>
                </CardContent>
            </Card>
        </Layout>
    );
};

export default Dashboard;
