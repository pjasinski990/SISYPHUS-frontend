import React, { createContext, useCallback, useContext, useState } from 'react';
import { TaskFormData } from 'src/components/task/TaskForm';
import { Task, taskService } from '../../service/taskService';
import { useAuth } from 'src/components/context/AuthContext';
import { TaskDialog } from 'src/components/task/TaskDialog';
import { ConfirmDialog } from 'src/components/library/ConfirmDialog';
import { TaskItem } from 'src/components/task/TaskItem';
import { useTaskList } from 'src/components/context/TaskListsContext';

interface TaskInteractionProviderType {
    openCreateTaskDialog: () => void;
    openEditTaskDialog: (task: Task) => void;
    openRemoveTaskDialog: (task: Task) => void;
}

const TaskInteractionContext = createContext<
    TaskInteractionProviderType | undefined
>(undefined);

export const TaskInteractionProvider: React.FC<{
    listName: string;
    children: React.ReactNode;
}> = ({ listName, children }) => {
    const { username } = useAuth();
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
    const [removingTask, setRemovingTask] = useState<Task | null>(null);
    const { tasks, setTasks } = useTaskList(listName);

    const createTask = useCallback(
        async (taskData: TaskFormData) => {
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
                };
                const created = await taskService.createTask(newTask);
                setTasks([...tasks, created]);
            } catch (err) {
                console.error('Failed to create task', err);
            }
        },
        [setTasks, tasks, username]
    );

    const editTask = useCallback(
        async (taskId: string, updatedTaskData: TaskFormData) => {
            try {
                const taskToUpdate = tasks.find(task => task.id === taskId);
                if (!taskToUpdate) {
                    console.error('Error: task not found');
                    return;
                }

                const updatedTask: Task = {
                    ...taskToUpdate,
                    ...updatedTaskData,
                    updatedAt: new Date().toISOString(),
                };

                setTasks(
                    tasks.map(task =>
                        task.id === updatedTask.id ? updatedTask : task
                    )
                );
                await taskService.updateTask(updatedTask);
            } catch (error) {
                console.error('Failed to update task:', error);
            }
        },
        [setTasks, tasks]
    );

    const removeTask = useCallback(
        async (taskId: string) => {
            try {
                await taskService.deleteTask(taskId);
                setTasks(tasks.filter(task => task.id !== taskId));
            } catch (error) {
                console.error('Failed to remove task:', error);
            }
        },
        [setTasks, tasks]
    );

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
        setEditingTask(task);
    }, []);

    const openRemoveTaskDialog = useCallback((task: Task) => {
        setRemovingTask(task);
    }, []);

    const contextValue = {
        tasks,
        openCreateTaskDialog: openCreateTaskDialog,
        openEditTaskDialog: openEditTaskDialog,
        openRemoveTaskDialog: openRemoveTaskDialog,
        createTask: createTask,
        editTask: editTask,
        removeTask: removeTask,
    };

    return (
        <TaskInteractionContext.Provider value={contextValue}>
            <TaskDialog
                open={isCreateTaskDialogOpen || !!editingTask}
                listName={listName}
                initialData={editingTask}
                onSubmit={handleTaskFormSubmit}
                onCancel={handleTaskFormCancel}
                title={`${
                    editingTask
                        ? `Edit ${listName.replace(/[^a-zA-Z]+/g, ' ').toLowerCase()} task`
                        : `Create ${listName.replace(/[^a-zA-Z]+/g, ' ').toLowerCase()} task`
                }`}
            />

            <ConfirmDialog
                open={!!removingTask}
                title="Confirmation"
                message="Remove this task from inbox?"
                onConfirm={handleConfirmRemoveTask}
                onCancel={handleCancelRemoveTask}
            >
                {removingTask && (
                    <TaskItem task={removingTask} isVanity={true} />
                )}
            </ConfirmDialog>
            {children}
        </TaskInteractionContext.Provider>
    );
};

export const useTaskInteraction = () => {
    const context = useContext(TaskInteractionContext);
    if (context === undefined) {
        throw new Error(
            'useTaskInteraction must be used within a TaskInteractionProvider'
        );
    }
    return context;
};
