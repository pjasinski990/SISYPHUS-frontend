import React, { useEffect, useState } from 'react';
import Layout from "src/components/Layout";
import { DailyPlan, dailyPlanService } from "../service/dailyPlanService";
import { Task, taskService } from "../service/taskService";
import { useAuth } from "../context/AuthContext";
import { formatToIsoDate } from "src/lib/utils";
import { DraggableLocation, DropResult } from "@hello-pangea/dnd";
import { DailyPlanDashboard } from "src/components/DailyPlanDashboard";
import { ReusableTaskPicker } from "src/components/ReusableTaskPicker";
import { TaskFormData } from "src/components/library/TaskForm";

const Dashboard: React.FC = () => {
    const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
    const [reusableTasks, setReusableTasks] = useState<Task[]>([]);
    const { username } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            const date = formatToIsoDate(new Date());
            try {
                const [dailyPlanData, reusableTasksData] = await Promise.all([
                    dailyPlanService.getDailyPlan(date),
                    taskService.getTasks()
                ]);
                setDailyPlan(dailyPlanData.plan);
                setReusableTasks(reusableTasksData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const onDragEnd = async (result: DropResult) => {
        const {source, destination} = result;
        if (!isValidDragAction(source, destination) || !dailyPlan) {
            return;
        }
        const newDailyPlan = moveTask(dailyPlan, source, destination!);
        setDailyPlan(newDailyPlan);
        await dailyPlanService.updateDailyPlan(newDailyPlan);
    };

    const isValidDragAction = (source: DraggableLocation, destination: DraggableLocation | null | undefined) => {
        if (!destination) {
            return false;
        }
        return !(source.droppableId === destination.droppableId &&
            source.index === destination.index);
    };

    const moveTask = (dailyPlan: DailyPlan, source: DraggableLocation, destination: DraggableLocation) => {
        const newDailyPlan: DailyPlan = { ...dailyPlan };
        const sourceList = source.droppableId === 'todo' ? newDailyPlan.todo : newDailyPlan.done;
        const destList = destination.droppableId === 'todo' ? newDailyPlan.todo : newDailyPlan.done;

        if (sourceList && destList) {
            const [movedTask] = sourceList.splice(source.index, 1);
            destList.splice(destination.index, 0, movedTask);
        }
        return newDailyPlan;
    };

    const handleCreateTaskInTodo = async (taskData: TaskFormData) => {
        try {
            let newTask: Task = {
                id: null,
                ...taskData,
                ownerUsername: username!,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            if (taskData.reusable) {
                newTask = await taskService.newTask(newTask);
                setReusableTasks((prevTasks) => [...prevTasks, newTask]);
            }
            const updatedDailyPlan = { ...dailyPlan, todo: [...dailyPlan?.todo || [], newTask] } as DailyPlan;
            setDailyPlan(updatedDailyPlan);
            await dailyPlanService.updateDailyPlan(updatedDailyPlan);
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    };

    const handleAddReusableTaskToTodo = async (newTask: Task) => {
        try {
            if (!dailyPlan || !newTask.id || findTaskInDailyPlan(dailyPlan, newTask.id)) {
                return;
            }
            const updatedDailyPlan = { ...dailyPlan, todo: [...dailyPlan.todo, newTask] } as DailyPlan;
            setDailyPlan(updatedDailyPlan);
            await dailyPlanService.updateDailyPlan(updatedDailyPlan);
        } catch (error) {
            console.error('Failed to move task:', error);
        }
    };

    const handleRemoveTaskFromDailyPlan = async (taskId: string) => {
        try {
            const updatedDailyPlan = removeTaskFromDailyPlan(dailyPlan!, taskId);
            setDailyPlan(updatedDailyPlan);
            await dailyPlanService.updateDailyPlan(updatedDailyPlan);
        } catch (error) {
            console.error('Failed to remove task:', error);
        }
    };

    const handleEditTask = async (taskId: string, updatedTaskData: TaskFormData) => {
        try {
            const taskToUpdate = findTaskInDailyPlan(dailyPlan!, taskId);
            if (!taskToUpdate) {
                console.log('Error: task not found');
                return;
            }

            const updatedTask: Task = {
                ...taskToUpdate,
                ...updatedTaskData,
                updatedAt: new Date().toISOString()
            };

            const updatedDailyPlan = updateTaskInDailyPlan(dailyPlan!, updatedTask);

            setDailyPlan(updatedDailyPlan);

            if (updatedTask.reusable && updatedTask.id) {
                await taskService.updateTask(updatedTask);
                setReusableTasks((prevTasks) =>
                    prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task)
                );
            }

            await dailyPlanService.updateDailyPlan(updatedDailyPlan);
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    };

    const handleEditReusableTask = async (taskId: string, updatedTaskData: TaskFormData) => {
        try {
            const taskToUpdate = reusableTasks.find((task) => task.id === taskId);
            if (!taskToUpdate) {
                console.log('Error: task not found');
                return;
            }

            const updatedTask: Task = {
                ...taskToUpdate,
                ...updatedTaskData,
                updatedAt: new Date().toISOString()
            };

            setReusableTasks((prevTasks) =>
                prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task)
            );
            await taskService.updateTask(updatedTask);
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    };

    const handleRemoveReusableTask = async (taskId: string) => {
        try {
            await taskService.deleteTask(taskId);
            setReusableTasks((prevTasks) => prevTasks.filter(task => task.id !== taskId));
        } catch (error) {
            console.error('Failed to remove task:', error);
        }
    };

    const findTaskInDailyPlan = (dailyPlan: DailyPlan, taskId: string): Task | null => {
        return dailyPlan.todo.find(task => task.id === taskId) ||
            dailyPlan.done.find(task => task.id === taskId) ||
            null;
    };

    const updateTaskInDailyPlan = (dailyPlan: DailyPlan, updatedTask: Task): DailyPlan => {
        return {
            ...dailyPlan,
            todo: dailyPlan.todo.map(task => task.id === updatedTask.id ? updatedTask : task),
            done: dailyPlan.done.map(task => task.id === updatedTask.id ? updatedTask : task)
        };
    };

    const removeTaskFromDailyPlan = (dailyPlan: DailyPlan, taskId: string): DailyPlan => {
        return {
            ...dailyPlan,
            todo: dailyPlan.todo.filter(task => task.id !== taskId),
            done: dailyPlan.done.filter(task => task.id !== taskId)
        };
    };

    return (
        <Layout>
            <div className="flex gap-4 mt-4">
                <div className="w-1/4">
                    <ReusableTaskPicker
                        tasks={reusableTasks}
                        onAddToTodo={handleAddReusableTaskToTodo}
                        onEditTask={handleEditReusableTask}
                        onRemoveTask={handleRemoveReusableTask}
                    />
                </div>
                <div className="w-3/4">
                    <DailyPlanDashboard
                        dailyPlan={dailyPlan}
                        onTaskMove={onDragEnd}
                        onEditTask={handleEditTask}
                        onAddTask={handleCreateTaskInTodo}
                        onRemoveTask={handleRemoveTaskFromDailyPlan}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
