import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from "src/components/Layout";
import { useAuth } from "src/context/AuthContext";
import { DailyPlan, DailyPlanService, dailyPlanService } from "../service/dailyPlanService";
import { DailyPlanComponent } from "src/components/DailyPlanComponent";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { DropResult } from "react-beautiful-dnd";
import { DraggableLocation } from "@hello-pangea/dnd";

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

        fetchDailyPlan().then(() => {});
    }, []);

    const onDragEnd = async (result: DropResult) => {
        const {source, destination} = result;
        if (!isValidDragAction(source, destination) || !dailyPlan) {
            return;
        }
        const newDailyPlan = moveTask(dailyPlan, source, destination!!);
        setDailyPlan(newDailyPlan)
        await dailyPlanService.updateDailyPlan(newDailyPlan)
    };

    const isValidDragAction = (source: DraggableLocation, destination: DraggableLocation | null | undefined) => {
        if (!destination) {
            return false;
        }
        return !(source.droppableId === destination.droppableId &&
            source.index === destination.index);
    }

    const moveTask = (dailyPlan: DailyPlan, source: DraggableLocation, destination: DraggableLocation) => {
        const newDailyPlan: DailyPlan = { ...dailyPlan };
        const sourceList = source.droppableId === 'todo' ? newDailyPlan.todo : newDailyPlan.done;
        const destList = destination.droppableId === 'todo' ? newDailyPlan.todo : newDailyPlan.done;

        if (sourceList && destList) {
            const [movedTask] = sourceList.splice(source.index, 1);
            destList.splice(destination.index, 0, movedTask);
        }
        return newDailyPlan
    }

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
