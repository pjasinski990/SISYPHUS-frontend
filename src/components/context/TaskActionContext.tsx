import React, { createContext, useCallback, useContext, useState } from 'react';
import { Task, taskService } from '../../service/taskService';
import { TaskDialog } from '../task/TaskDialog';
import { ConfirmDialog } from '../library/ConfirmDialog';
import { useAllTaskLists } from './TaskListsContext';
import { TaskFormData } from 'src/components/task/TaskForm';
import { TaskItem } from 'src/components/task/TaskItem';
import { TaskDetailsDialog } from 'src/components/task/TaskDetailsDialog';
import { useAuth } from 'src/components/context/AuthContext';
import { UnravelDialog } from 'src/components/task/UnravelDialog';

interface TaskActionContextType {
    openCreateTaskDialog: (listName: string) => void;
    openEditTaskDialog: (task: Task) => void;
    openRemoveTaskDialog: (task: Task) => void;
    openTaskDetailsDialog: (task: Task) => void;
    openUnravelTaskDialog: (task: Task) => void;
    moveTask: (task: Task, destinationList: string) => Promise<Task | null>;
    setHighlight: (taskId: string | null) => void;
    highlightedTaskId: string | null;
}

const TaskActionContext = createContext<TaskActionContextType | undefined>(
    undefined
);

export interface TaskActionProviderProps {
    children: React.ReactNode;
    onTaskFormSubmit?: (
        taskData: TaskFormData,
        editingTask: Task | null,
        creatingTaskForList: string | null
    ) => void;
    onConfirmRemoveTask?: (task: Task) => void;
}

export const TaskActionProvider: React.FC<TaskActionProviderProps> = ({
    children,
    onTaskFormSubmit,
    onConfirmRemoveTask,
}) => {
    const { username } = useAuth();
    const [showingDetailsTask, setShowingDetailsTask] = useState<Task | null>(
        null
    );
    const [creatingTaskForList, setCreatingTaskForList] = useState<
        string | null
    >(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [removingTask, setRemovingTask] = useState<Task | null>(null);
    const [unravelingTask, setUnravellingTask] = useState<Task | null>(null);
    const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(
        null
    );

    const taskListContexts = useAllTaskLists();

    const openCreateTaskDialog = useCallback((listName: string) => {
        setCreatingTaskForList(listName);
    }, []);

    const openEditTaskDialog = useCallback((task: Task) => {
        setEditingTask(task);
    }, []);

    const openRemoveTaskDialog = useCallback((task: Task) => {
        setRemovingTask(task);
    }, []);

    const openTaskDetailsDialog = useCallback((task: Task) => {
        setShowingDetailsTask(task);
    }, []);

    const openUnravelTaskDialog = useCallback((task: Task) => {
        setUnravellingTask(task);
    }, []);

    const closeTaskDetailsDialog = useCallback(() => {
        setShowingDetailsTask(null);
    }, []);

    const createTask = useCallback(
        async (taskData: TaskFormData, listName: string) => {
            if (!username) {
                throw Error('Error retrieving username');
            }
            try {
                const newTask: Task = {
                    id: null,
                    ...taskData,
                    ownerUsername: username,
                    listName: listName,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    finishedAt: null,
                };
                const created = await taskService.createTask(newTask);
                taskListContexts[listName].setTasks([
                    ...taskListContexts[listName].taskList.tasks,
                    created,
                ]);
                setHighlightedTaskId(created.id);
                setCreatingTaskForList(null);
                return created;
            } catch (err) {
                console.error('Failed to create task', err);
                setCreatingTaskForList(null);
                return null;
            }
        },
        [username, taskListContexts]
    );

    const handleTaskFormSubmit = useCallback(
        async (taskData: TaskFormData) => {
            if (onTaskFormSubmit) {
                onTaskFormSubmit(taskData, editingTask, creatingTaskForList);
                setEditingTask(null);
                setCreatingTaskForList(null);
            } else {
                if (editingTask) {
                    try {
                        const updatedTask = { ...editingTask, ...taskData };
                        await taskService.updateTask(updatedTask);

                        const listName = updatedTask.listName;
                        const list = taskListContexts[listName].taskList;
                        const setTasks = taskListContexts[listName].setTasks;
                        if (list) {
                            const tasks = list.tasks;
                            const taskIndex = tasks.findIndex(
                                task => task.id === updatedTask.id
                            );
                            if (taskIndex !== -1) {
                                const updatedTasks = [...tasks];
                                updatedTasks[taskIndex] = updatedTask;
                                setTasks(updatedTasks);
                            }
                        }

                        setHighlightedTaskId(updatedTask.id);
                    } catch (error) {
                        console.error('Failed to update task', error);
                    } finally {
                        setEditingTask(null);
                    }
                } else if (creatingTaskForList) {
                    await createTask(taskData, creatingTaskForList);
                }
            }
        },
        [
            editingTask,
            creatingTaskForList,
            taskListContexts,
            createTask,
            onTaskFormSubmit,
        ]
    );

    const handleTaskFormCancel = useCallback(() => {
        setEditingTask(null);
        setCreatingTaskForList(null);
    }, []);

    const handleConfirmRemoveTask = useCallback(async () => {
        if (onConfirmRemoveTask) {
            if (removingTask) {
                onConfirmRemoveTask(removingTask);
            }
            setRemovingTask(null);
        } else {
            if (removingTask) {
                try {
                    await taskService.deleteTask(removingTask.id!);

                    const listName = removingTask.listName;
                    const list = taskListContexts[listName];
                    if (list) {
                        const tasks = list.taskList.tasks;
                        list.setTasks(
                            tasks.filter(task => task.id !== removingTask.id)
                        );
                    }

                    if (removingTask.id === highlightedTaskId) {
                        setHighlightedTaskId(null);
                    }
                } catch (error) {
                    console.error('Failed to delete task', error);
                } finally {
                    setRemovingTask(null);
                }
            }
        }
    }, [
        removingTask,
        taskListContexts,
        highlightedTaskId,
        onConfirmRemoveTask,
    ]);

    const handleCancelRemoveTask = useCallback(() => {
        setRemovingTask(null);
    }, []);

    const handleUnravelTaskSubmit = useCallback((generatedTasks: Task[]) => {
        for (const task of generatedTasks) {
            taskService.createTask(task);
        }
    }, []);

    const handleUnravelTaskCancel = useCallback(() => {
        setUnravellingTask(null);
    }, []);

    const handleMoveTask = useCallback(
        async (task: Task, destinationList: string): Promise<Task | null> => {
            if (!Object.keys(taskListContexts).includes(destinationList)) {
                console.warn(
                    `Destination list "${destinationList}" does not exist.`
                );
                return null;
            }
            const currentList = task.listName;
            const updatedTask = {
                ...task,
                listName: destinationList,
                finishedAt:
                    destinationList === 'DAILY_DONE'
                        ? new Date().toISOString()
                        : null,
            };

            try {
                if (currentList === 'REUSABLE') {
                    const savedTask = await taskService.createTask(updatedTask);
                    taskListContexts[destinationList].setTasks([
                        ...taskListContexts[destinationList].taskList.tasks,
                        savedTask,
                    ]);
                    setHighlightedTaskId(savedTask.id);
                    return savedTask;
                } else {
                    await taskService.updateTask(updatedTask);
                    taskListContexts[currentList].setTasks(
                        taskListContexts[currentList].taskList.tasks.filter(
                            t => t.id !== task.id
                        )
                    );
                    taskListContexts[destinationList].setTasks([
                        ...taskListContexts[destinationList].taskList.tasks,
                        updatedTask,
                    ]);
                    setHighlightedTaskId(updatedTask.id);
                    return updatedTask;
                }
            } catch (error) {
                console.error('Failed to move task', error);
                return null;
            }
        },
        [taskListContexts]
    );

    const value: TaskActionContextType = {
        openCreateTaskDialog,
        openEditTaskDialog,
        openRemoveTaskDialog,
        openTaskDetailsDialog,
        openUnravelTaskDialog,
        moveTask: handleMoveTask,
        setHighlight: setHighlightedTaskId,
        highlightedTaskId,
    };

    return (
        <TaskActionContext.Provider value={value}>
            {/* Task Details Dialog */}
            <TaskDetailsDialog
                open={!!showingDetailsTask}
                task={showingDetailsTask!}
                onClose={closeTaskDetailsDialog}
            />

            {/* Edit/Create Task Dialog */}
            <TaskDialog
                open={!!editingTask || !!creatingTaskForList}
                listName={editingTask?.listName || creatingTaskForList || ''}
                initialData={editingTask}
                onSubmit={handleTaskFormSubmit}
                onCancel={handleTaskFormCancel}
                title={
                    editingTask
                        ? `Edit ${editingTask.listName
                              .replace(/[^a-zA-Z]+/g, ' ')
                              .toLowerCase()} task`
                        : `Create ${creatingTaskForList
                              ?.replace(/[^a-zA-Z]+/g, ' ')
                              .toLowerCase()} task`
                }
            />

            {/* Unravel Dialog */}
            <UnravelDialog
                open={!!unravelingTask}
                unraveledTask={unravelingTask}
                onSubmit={handleUnravelTaskSubmit}
                onCancel={handleUnravelTaskCancel}
            />

            {/* Confirm Remove Task Dialog */}
            <ConfirmDialog
                open={!!removingTask}
                title="Confirmation"
                message={`Remove this task from ${removingTask?.listName
                    .replace(/[^a-zA-Z]+/g, ' ')
                    .toLowerCase()}?`}
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
