import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { TaskFormData } from "src/components/task/TaskForm";
import { Task, taskService } from "../../service/taskService";
import { useAuth } from "src/components/context/AuthContext";

interface TaskInteractionProviderType {
    tasks: Task[],
    onRemoveTask: (taskId: string) => Promise<void>;
    onCreateTask: (task: TaskFormData) => void;
    onEditTask: (taskId: string, updatedTaskData: TaskFormData) => Promise<void>;
}

const TaskInteractionProvider = createContext<TaskInteractionProviderType | undefined>(undefined);

export const TaskInteractionContext: React.FC<{ children: React.ReactNode, listName: string }> = ({ children, listName }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const { username } = useAuth();

    const tasksRef = useRef(tasks);
    useEffect(() => {
        tasksRef.current = tasks;
    }, [tasks]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const taskData = await taskService.getTasksList(listName);
                console.log(`fetched tasks for list ${listName}: ${taskData.map(task => task.id).join(",")}`);
                setTasks(taskData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData().then();
    }, [listName]);

    const createTask = useCallback(async (taskData: TaskFormData) => {
        if (!username) {
            throw Error('Error retrieving username');
        }
        try {
            let newTask: Task = {
                id: null,
                ...taskData,
                ownerUsername: username,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                finishedAt: null,
            }
            const created = await taskService.createTask(newTask)
            console.log(`created task ${created}\nfor list: ${listName}`)
            setTasks([...tasks, created])
        } catch (err) {
            console.error('Failed to create task', err);
        }
    }, [listName, tasks, username]);

    const editTask = useCallback(async (taskId: string, updatedTaskData: TaskFormData) => {
        try {
            const taskToUpdate = tasks.find((task) => task.id === taskId);
            if (!taskToUpdate) {
                console.log('Error: task not found');
                return;
            }

            const updatedTask: Task = {
                ...taskToUpdate,
                ...updatedTaskData,
                updatedAt: new Date().toISOString()
            };

            setTasks((prevTasks) =>
                prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task)
            );
            await taskService.updateTask(updatedTask);
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    }, [tasks]);

    const removeTask = useCallback(async (taskId: string) => {
        try {
            await taskService.deleteTask(taskId);
            setTasks((prevTasks) => prevTasks.filter(task => task.id !== taskId));
        } catch (error) {
            console.error('Failed to remove task:', error);
        }
    }, []);

    const contextValue = useMemo(() => ({
        tasks,
        onCreateTask: createTask,
        onEditTask: editTask,
        onRemoveTask: removeTask,
    }), [tasks, createTask, editTask, removeTask]);

    return (
        <TaskInteractionProvider.Provider value={contextValue}>
            {children}
        </TaskInteractionProvider.Provider>
    );
};

export const useTaskInteraction = () => {
    const context = useContext(TaskInteractionProvider);
    if (context === undefined) {
        throw new Error('useTasksInteraction must be used within an TaskInteractionProvider');
    }
    return context;
};
