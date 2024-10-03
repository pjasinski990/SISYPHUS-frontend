import React, { createContext, useCallback, useContext, useState } from 'react';
import { Task, taskService } from '../../service/taskService';
import { TaskDialog } from '../task/TaskDialog';
import { ConfirmDialog } from '../library/ConfirmDialog';
import { useAllTaskLists } from './TaskListsContext';
import { TaskFormData } from 'src/components/task/TaskForm';
import { TaskItem } from 'src/components/task/TaskItem';
import { util } from 'zod';
import objectKeys = util.objectKeys;

interface TaskActionContextType {
    openEditTaskDialog: (task: Task) => void;
    openRemoveTaskDialog: (task: Task) => void;
    moveTask: (task: Task, destinationList: string) => void;
}

const TaskActionContext = createContext<TaskActionContextType | undefined>(
    undefined
);

export const TaskActionProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [removingTask, setRemovingTask] = useState<Task | null>(null);

    const tasksLists = useAllTaskLists();

    const openEditTaskDialog = useCallback((task: Task) => {
        setEditingTask(task);
    }, []);

    const openRemoveTaskDialog = useCallback((task: Task) => {
        setRemovingTask(task);
    }, []);

    const handleMoveTask = useCallback(
        (task: Task, destinationList: string) => {
            if (!objectKeys(tasksLists).includes(destinationList)) {
                return;
            }
            const currentList = task.listName;
            const updatedTask = { ...task, listName: destinationList };

            taskService.updateTask(updatedTask).then();
            tasksLists[currentList].setTasks(
                tasksLists[currentList].tasks.filter(t => t.id !== task.id)
            );

            tasksLists[destinationList].setTasks([
                ...tasksLists[destinationList].tasks,
                updatedTask,
            ]);
        },
        [tasksLists]
    );

    const handleTaskFormSubmit = useCallback(
        async (taskData: TaskFormData) => {
            if (editingTask) {
                try {
                    const updatedTask = { ...editingTask, ...taskData };
                    await taskService.updateTask(updatedTask);

                    const listName = updatedTask.listName;
                    const list = tasksLists[listName];
                    if (list) {
                        const tasks = list.tasks;
                        const taskIndex = tasks.findIndex(
                            task => task.id === updatedTask.id
                        );
                        if (taskIndex !== -1) {
                            tasks[taskIndex] = updatedTask;
                            list.setTasks([...tasks]);
                        }
                    }
                } catch (error) {
                    console.error('Failed to update task', error);
                } finally {
                    setEditingTask(null);
                }
            }
        },
        [editingTask, tasksLists]
    );

    const handleTaskFormCancel = useCallback(() => {
        setEditingTask(null);
    }, []);

    const handleConfirmRemoveTask = useCallback(async () => {
        if (removingTask) {
            try {
                await taskService.deleteTask(removingTask.id!);

                const listName = removingTask.listName;
                const list = tasksLists[listName];
                if (list) {
                    const tasks = list.tasks;
                    list.setTasks(
                        tasks.filter(task => task.id !== removingTask.id)
                    );
                }
            } catch (error) {
                console.error('Failed to delete task', error);
            } finally {
                setRemovingTask(null);
            }
        }
    }, [removingTask, tasksLists]);

    const handleCancelRemoveTask = useCallback(() => {
        setRemovingTask(null);
    }, []);

    return (
        <TaskActionContext.Provider
            value={{
                openEditTaskDialog,
                openRemoveTaskDialog,
                moveTask: handleMoveTask,
            }}
        >
            <TaskDialog
                open={!!editingTask}
                listName={editingTask?.listName || ''}
                initialData={editingTask}
                onSubmit={handleTaskFormSubmit}
                onCancel={handleTaskFormCancel}
                title={`Edit ${editingTask?.listName.replace(/[^a-zA-Z]+/g, ' ').toLowerCase()} task`}
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
        </TaskActionContext.Provider>
    );
};

export const useTaskAction = () => {
    const context = useContext(TaskActionContext);
    if (!context) {
        throw new Error(
            'useTaskAction must be used within a TaskActionProvider'
        );
    }
    return context;
};
