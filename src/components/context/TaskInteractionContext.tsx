import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { TaskFormData } from "src/components/task/TaskForm";
import { Task, taskService } from "../../service/taskService";
import { useAuth } from "src/components/context/AuthContext";
import { TaskDialog } from "src/components/task/TaskDialog";
import { ConfirmDialog } from "src/components/library/ConfirmDialog";
import { TaskItem } from "src/components/task/TaskItem";

interface TaskInteractionProviderType {
    openCreateTaskDialog: () => void;
    openEditTaskDialog: (task: Task) => void;
    openRemoveTaskDialog: (task: Task) => void;
    removeTask: (taskId: string) => Promise<void>,
    createTask: (task: TaskFormData) => void,
    editTask: (taskId: string, updatedTaskData: TaskFormData) => Promise<void>,
}

const TaskInteractionContext = createContext<TaskInteractionProviderType | undefined>(undefined);

export const TaskInteractionProvider: React.FC<{
    listName: string,
    tasks: Task[],
    setTasks: (tasks: Task[]) => void,
    children: React.ReactNode,
}> = ({
                                               listName,
                                               tasks,
                                               setTasks,
                                               children,
}) => {
    const { username } = useAuth();
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
    const [removingTask, setRemovingTask] = useState<Task | null>(null);

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
    }, [listName, setTasks]);

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
    }, [listName, setTasks, tasks, username]);

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

            setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
            await taskService.updateTask(updatedTask);
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    }, [setTasks, tasks]);

    const removeTask = useCallback(async (taskId: string) => {
        try {
            await taskService.deleteTask(taskId);
            setTasks(tasks.filter(task => task.id !== taskId));
        } catch (error) {
            console.error('Failed to remove task:', error);
        }
    }, [setTasks, tasks]);

    const handleTaskFormSubmit = useCallback(
        async (taskData: TaskFormData) => {
            if (editingTask) {
                await editTask(editingTask.id!, taskData);
                setEditingTask(null);
            } else {
                await createTask(taskData);
                setIsCreateTaskDialogOpen(false);
            }
        },
        [editingTask, createTask, editTask]
    );

    const handleTaskFormCancel = useCallback(() => {
        setIsCreateTaskDialogOpen(false);
        setEditingTask(null);
    }, []);

    const handleConfirmRemoveTask = useCallback(async () => {
        if (removingTask) {
            await removeTask(removingTask.id!);
            setRemovingTask(null);
        }
    }, [removeTask, removingTask]);

    const handleCancelRemoveTask = useCallback(() => {
        setRemovingTask(null);
    }, []);

    const openCreateTaskDialog = useCallback(() => {
        setIsCreateTaskDialogOpen(true);
    }, []);

    const openEditTaskDialog = useCallback((task: Task) => {
        setEditingTask(task)
    }, []);

    const openRemoveTaskDialog = useCallback((task: Task) => {
        setRemovingTask(task)
    }, []);

    const contextValue = useMemo(() => ({
        tasks,
        openCreateTaskDialog: openCreateTaskDialog,
        openEditTaskDialog: openEditTaskDialog,
        openRemoveTaskDialog: openRemoveTaskDialog,
        createTask: createTask,
        editTask: editTask,
        removeTask: removeTask,
    }), [tasks, openCreateTaskDialog, openEditTaskDialog, openRemoveTaskDialog, createTask, editTask, removeTask]);

    return (
        <TaskInteractionContext.Provider value={contextValue}>
            <TaskDialog
                open={isCreateTaskDialogOpen || !!editingTask}
                listName={listName}
                initialData={editingTask}
                onSubmit={handleTaskFormSubmit}
                onCancel={handleTaskFormCancel}
                title={`${editingTask ? 'Edit inbox task' : 'Create inbox task'}`}
            />

            <ConfirmDialog
                open={!!removingTask}
                title="Confirmation"
                message="Remove this task from inbox?"
                onConfirm={handleConfirmRemoveTask}
                onCancel={handleCancelRemoveTask}
            >
                {removingTask && <TaskItem task={removingTask} isVanity={true}/>}
            </ConfirmDialog>
            {children}
        </TaskInteractionContext.Provider>
    );
};

export const useTaskInteraction = () => {
    const context = useContext(TaskInteractionContext);
    if (context === undefined) {
        throw new Error('useTaskInteraction must be used within a TaskInteractionProvider');
    }
    return context;
};
