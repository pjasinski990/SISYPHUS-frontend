import React, { useEffect, useState } from 'react';
import Layout from "src/components/Layout";
import { Task, taskService } from "../service/taskService";
import { DailyPlanDashboard } from "src/components/DailyPlanDashboard";
import { ReusableTaskPicker } from "src/components/ReusableTaskPicker";
import { TaskFormData } from "src/components/task/TaskForm";
import { SlidingPanel } from "src/components/library/SlidingPanel";
import { ChevronRight } from "lucide-react";
import { DailyPlanProvider } from "src/components/context/DailyPlanContext";

const Dashboard: React.FC = () => {
    const [reusableTasks, setReusableTasks] = useState<Task[]>([]);
    const [isTaskPickerOpen, setIsTaskPickerOpen] = useState(true);

    const toggleTaskPicker = () => {
        setIsTaskPickerOpen(!isTaskPickerOpen);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [reusableTasksData] = await Promise.all([
                    taskService.getTasks()
                ]);
                setReusableTasks(reusableTasksData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData().then();
    }, []);

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

    return (
        <Layout>
            <div>
                <div className="flex h-full">
                    <DailyPlanProvider>
                        <SlidingPanel
                            isOpen={isTaskPickerOpen}
                            setIsOpen={toggleTaskPicker}
                            maxWidth={400}
                        >
                            <ReusableTaskPicker
                                tasks={reusableTasks}
                                onEditTask={handleEditReusableTask}
                                onRemoveTask={handleRemoveReusableTask}
                            />
                        </SlidingPanel>
                        <div className={`flex flex-1 transition-all duration-200`}>
                            <div
                                onClick={() => toggleTaskPicker()}
                                className={`h-full w-8 bg-white hover:bg-slate-50 dark:bg-slate-950 hover:dark:bg-slate-900 flex items-center justify-center cursor-pointer ${isTaskPickerOpen ? 'mr-[20px] ml-[1px]' : 'mr-[1px]'}`}
                            >
                                <ChevronRight
                                    size={24}
                                    className={`text-slate-500 transition-transform duration-200 ${
                                        isTaskPickerOpen ? 'rotate-0' : 'rotate-180'
                                    }`}
                                />
                            </div>
                            <DailyPlanDashboard />
                        </div>
                    </DailyPlanProvider>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
