import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { TaskFormData } from "src/components/task/TaskForm";
import { Task, taskService } from "../../service/taskService";
import { useAuth } from "src/components/context/AuthContext";

interface ReusableTasksContextType {
    reusableTasks: Task[],
    onRemoveTask: (taskId: string) => Promise<void>;
    onCreateTask: (task: TaskFormData) => void;
    onEditTask: (taskId: string, updatedTaskData: TaskFormData) => Promise<void>;
}

const ReusableTasksContext = createContext<ReusableTasksContextType | undefined>(undefined);

export const ReusableTasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [reusableTasks, setReusableTasks] = useState<Task[]>([]);
    const { username } = useAuth();

    const reusableTasksRef = useRef(reusableTasks);
    useEffect(() => {
        reusableTasksRef.current = reusableTasks;
    }, [reusableTasks]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const reusableTasksData = await taskService.getTasks();
                setReusableTasks(reusableTasksData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData().then();
    }, []);

    const createTask = useCallback(async (taskData: TaskFormData) => {
        try {
            let newTask: Task = {
                id: null,
                ...taskData,
                ownerUsername: username!!,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
            const created = await taskService.createTask(newTask)
            setReusableTasks([...reusableTasks, created])
        } catch (err) {
            console.error('Failed to create task', err);
        }
    }, [reusableTasks, username]);

    const editTask = useCallback(async (taskId: string, updatedTaskData: TaskFormData) => {
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
    }, [reusableTasks]);

    const removeTask = useCallback(async (taskId: string) => {
        try {
            await taskService.deleteTask(taskId);
            setReusableTasks((prevTasks) => prevTasks.filter(task => task.id !== taskId));
        } catch (error) {
            console.error('Failed to remove task:', error);
        }
    }, []);

    const contextValue = useMemo(() => ({
        reusableTasks,
        onCreateTask: createTask,
        onEditTask: editTask,
        onRemoveTask: removeTask,
    }), [reusableTasks, createTask, editTask, removeTask]);

    return (
        <ReusableTasksContext.Provider value={contextValue}>
            {children}
        </ReusableTasksContext.Provider>
    );
};

export const useReusableTasks = () => {
    const context = useContext(ReusableTasksContext);
    if (context === undefined) {
        throw new Error('useReusableTasks must be used within a ReusableTasksProvider');
    }
    return context;
};
