import React, { createContext, useCallback, useContext, useState } from 'react';
import { Task } from '../../service/taskService';
import { TaskDialog } from '../dialog/TaskDialog';
import { ConfirmDialog } from '../dialog/ConfirmDialog';
import { useAllTaskLists } from './TaskListsContext';
import { TaskFormData } from '../task/task_form/taskFormData';
import { TaskItem } from 'src/components/task/TaskItem';
import { TaskDetailsDialog } from 'src/components/dialog/TaskDetailsDialog';
import { useAuth } from 'src/components/context/AuthContext';
import { UnravelDialog } from 'src/components/dialog/UnravelDialog';
import { PersistenceProvider } from '../../persistence_provider/PersistenceProvider';

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

export const TaskActionContext = createContext<
    TaskActionContextType | undefined
>(undefined);

export interface TaskActionProviderProps {
    children: React.ReactNode;
    persistenceProvider: PersistenceProvider;
}

export const TaskActionProvider: React.FC<TaskActionProviderProps> = ({
    children,
    persistenceProvider,
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

    const editTask = useCallback(
        async (taskData: TaskFormData) => {
            if (!editingTask) {
                return;
            }
            try {
                const updatedTask: Task = { ...editingTask, ...taskData };
                await persistenceProvider.updateTask(updatedTask);

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
        },
        [editingTask, persistenceProvider, taskListContexts]
    );

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
                const created = await persistenceProvider.createTask(newTask);
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
        [username, persistenceProvider, taskListContexts]
    );

    const handleTaskFormSubmit = useCallback(
        async (taskData: TaskFormData) => {
            if (editingTask) {
                await editTask(taskData);
            } else if (creatingTaskForList) {
                await createTask(taskData, creatingTaskForList);
            }
        },
        [editingTask, creatingTaskForList, editTask, createTask]
    );

    const handleTaskFormCancel = useCallback(() => {
        setEditingTask(null);
        setCreatingTaskForList(null);
    }, []);

    const handleConfirmRemoveTask = useCallback(async () => {
        if (!removingTask) {
            return;
        }

        const listName = removingTask.listName;
        const list = taskListContexts[listName];
        if (list) {
            const tasks = list.taskList.tasks;
            list.setTasks(tasks.filter(task => task.id !== removingTask.id));
        }
        if (removingTask.id === highlightedTaskId) {
            setHighlightedTaskId(null);
        }
        try {
            await persistenceProvider.deleteTask(removingTask.id!);
        } catch (error) {
            console.error('Failed to delete task', error);
        } finally {
            setRemovingTask(null);
        }
    }, [
        removingTask,
        taskListContexts,
        highlightedTaskId,
        persistenceProvider,
    ]);

    const handleCancelRemoveTask = useCallback(() => {
        setRemovingTask(null);
    }, []);

    const handleUnravelTaskSubmit = useCallback(
        async (generatedTasks: Task[]) => {
            if (!unravelingTask || generatedTasks.length === 0) {
                return;
            }

            try {
                const createdTasks = await Promise.all(
                    generatedTasks.map(async task => {
                        return await persistenceProvider.createTask(task);
                    })
                );

                const inboxListContext = taskListContexts['INBOX'];
                if (inboxListContext) {
                    inboxListContext.setTasks([
                        ...inboxListContext.taskList.tasks,
                        ...createdTasks,
                    ]);
                } else {
                    console.warn(
                        'INBOX task list not found when trying to update with unraveled tasks'
                    );
                }

                const createdTaskIds = createdTasks
                    .map(task => task.id)
                    .filter((id): id is string => id !== null);

                setHighlightedTaskId(createdTaskIds[0] ?? highlightedTaskId);

                const updatedUnraveledTask: Task = {
                    ...unravelingTask,
                    dependencies: [
                        ...(unravelingTask.dependencies || []),
                        ...createdTaskIds,
                    ],
                    updatedAt: new Date().toISOString(),
                };

                await persistenceProvider.updateTask(updatedUnraveledTask);
            } catch (error) {
                console.error('Error handling unravel task submit', error);
            } finally {
                setUnravellingTask(null);
            }
        },
        [
            unravelingTask,
            taskListContexts,
            highlightedTaskId,
            persistenceProvider,
        ]
    );

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
                    const savedTask =
                        await persistenceProvider.createTask(updatedTask);
                    taskListContexts[destinationList].setTasks([
                        ...taskListContexts[destinationList].taskList.tasks,
                        savedTask,
                    ]);
                    setHighlightedTaskId(savedTask.id);
                    return savedTask;
                } else {
                    await persistenceProvider.updateTask(updatedTask);
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
        [persistenceProvider, taskListContexts]
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
