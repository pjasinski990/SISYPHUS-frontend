import React, { useEffect, useState } from 'react';
import Layout from "src/components/Layout";
import { DailyPlan, dailyPlanService } from "../service/dailyPlanService";
import { DailyPlanComponent, TaskFormData } from "src/components/DailyPlanComponent";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { DropResult } from "react-beautiful-dnd";
import { DraggableLocation } from "@hello-pangea/dnd";
import { formatToIsoDate } from "src/lib/utils";
import { Task, taskService } from "../service/taskService";
import { useAuth } from "../context/AuthContext";

const Dashboard: React.FC = () => {
    const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);

    const { username } = useAuth();

    useEffect(() => {
        const fetchDailyPlan = async () => {
            const date = formatToIsoDate(new Date());
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

    const handleAddTask = async (taskData: TaskFormData) => {
        try {
            const newTask: Task = {
                id: null,
                ...taskData,
                ownerUsername: username!!,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            const createdTask = await taskService.newTask(newTask);
            const updatedDailyPlan = { ...dailyPlan, todo: [...dailyPlan!!.todo, createdTask] } as DailyPlan;
            setDailyPlan(updatedDailyPlan);
            await dailyPlanService.updateDailyPlan(updatedDailyPlan);
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    };

    const handleEditTask = async (taskId: string, updatedTaskData: TaskFormData) => {
        try {
            const taskToUpdate = dailyPlan!!.todo.find(task => task.id === taskId) ||
                dailyPlan!!.done.find(task => task.id === taskId);
            if (!taskToUpdate) {
                console.log('Error: task not found')
                return
            }
            const updatedTask: Task = {
                ...taskToUpdate,
                ...updatedTaskData,
                updatedAt: new Date().toISOString()
            };
            const updatedDailyPlan = {
                ...dailyPlan,
                todo: dailyPlan!!.todo.map(task => task.id === taskId ? updatedTask : task),
                done: dailyPlan!!.done.map(task => task.id === taskId ? updatedTask : task)
            } as DailyPlan;

            setDailyPlan(updatedDailyPlan);
            await taskService.updateTask(updatedTask);
            await dailyPlanService.updateDailyPlan(updatedDailyPlan);
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    };

    return (
        <Layout>
            <Card className="w-full max-w-3xl">
                <CardHeader>
                    <CardTitle>Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <DailyPlanComponent dailyPlan={dailyPlan} onTaskMove={onDragEnd} onEditTask={handleEditTask} onAddTask={handleAddTask} />
                </CardContent>
            </Card>
        </Layout>
    );
};

export default Dashboard;
