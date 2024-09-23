import React, { createContext, useContext, useEffect, useState } from "react";
import { TaskFormData } from "src/components/task/TaskForm";
import { Task, taskService } from "../../service/taskService";

interface ReusableTasksContextType {
    reusableTasks: Task[],
    onRemoveTask: (taskId: string) => Promise<void>;
    onCreateTask: (task: TaskFormData) => void;
    onEditTask: (taskId: string, updatedTaskData: TaskFormData) => Promise<void>;
}

const ReusableTasksContext = createContext<ReusableTasksContextType | undefined>(undefined);

export const ReusableTasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [reusableTasks, setReusableTasks] = useState<Task[]>([]);

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

    const createTask = async (taskData: TaskFormData): Promise<void> => {

    }

    const editTask = async (taskId: string, updatedTaskData: TaskFormData) => {
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

    const removeTask = async (taskId: string) => {
        try {
            await taskService.deleteTask(taskId);
            setReusableTasks((prevTasks) => prevTasks.filter(task => task.id !== taskId));
        } catch (error) {
            console.error('Failed to remove task:', error);
        }
    };
    return (
        <ReusableTasksContext.Provider
            value={{
                reusableTasks: reusableTasks,
                onCreateTask: createTask,
                onEditTask: editTask,
                onRemoveTask: removeTask,
            }}
        >
            {children}
        </ReusableTasksContext.Provider>
    );
};

export const useReusableTasks = () => {
    const context = useContext(ReusableTasksContext);
    if (context === undefined) {
        throw new Error('useDailyPlan must be used within a DailyPlanProvider');
    }
    return context;
};