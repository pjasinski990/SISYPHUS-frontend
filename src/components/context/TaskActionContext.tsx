import React, { createContext, useCallback, useContext, useState } from 'react';
import { Task, taskService } from '../../service/taskService';
import { TaskDialog } from '../task/TaskDialog';
import { ConfirmDialog } from '../library/ConfirmDialog';
import { useAllTaskLists } from './TaskListsContext';
import { TaskFormData } from 'src/components/task/TaskForm';
import { TaskItem } from 'src/components/task/TaskItem';
import { util } from 'zod';
import objectKeys = util.objectKeys;
import { TaskDetailsDialog } from 'src/components/task/TaskDetailsDialog';
import { useAuth } from 'src/components/context/AuthContext';

interface TaskActionContextType {
    openCreateTaskDialog: (listName: string) => void;
    openEditTaskDialog: (task: Task) => void;
    openRemoveTaskDialog: (task: Task) => void;
    openTaskDetailsDialog: (task: Task) => void;
    moveTask: (task: Task, destinationList: string) => void;
}

const TaskActionContext = createContext<TaskActionContextType | undefined>(
    undefined
);

export const TaskActionProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
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

    const taskLists = useAllTaskLists();

    const openCreateTaskDialog = useCallback((listName: string) => {
        setCreatingTaskForList(listName);
    }, []);

    const openEditTaskDialog = useCallback((task: Task) => {
        setEditingTask(task);
    }, []);

    const openRemoveTaskDialog = useCallback((task: Task) => {
        setRemovingTask(task);
    }, []);

    const handleMoveTask = useCallback(
        async (task: Task, destinationList: string) => {
            if (!objectKeys(taskLists).includes(destinationList)) {
                return;
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

            if (currentList === 'REUSABLE') {
                const savedTask = await taskService.createTask(updatedTask);
                taskLists[currentList].setTasks(
                    taskLists[currentList].taskList.tasks.map((t: Task) => {
                        if (t.id === task.id) {
                            t.id = savedTask.id;
                        }
                        return t;
                    })
                );
            } else {
                await taskService.updateTask(updatedTask);
                taskLists[currentList].setTasks(
                    taskLists[currentList].taskList.tasks.filter(
                        t => t.id !== task.id
                    )
                );
            }

            taskLists[destinationList].setTasks([
                ...taskLists[destinationList].taskList.tasks,
                updatedTask,
            ]);
        },
        [taskLists]
    );

    const openTaskDetailsDialog = useCallback((task: Task) => {
        setShowingDetailsTask(task);
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
                let newTask: Task = {
                    id: null,
                    ...taskData,
                    ownerUsername: username,
                    listName: listName,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    finishedAt: null,
                };
                const created = await taskService.createTask(newTask);
                taskLists[listName].setTasks([
                    ...taskLists[listName].taskList.tasks,
                    created,
                ]);
            } catch (err) {
                console.error('Failed to create task', err);
            } finally {
                setCreatingTaskForList(null);
            }
        },
        [username, taskLists]
    );

    const handleTaskFormSubmit = useCallback(
        async (taskData: TaskFormData) => {
            if (editingTask) {
                try {
                    const updatedTask = { ...editingTask, ...taskData };
                    await taskService.updateTask(updatedTask);

                    const listName = updatedTask.listName;
                    const list = taskLists[listName].taskList;
                    const setTasks = taskLists[listName].setTasks;
                    if (list) {
                        const tasks = list.tasks;
                        const taskIndex = tasks.findIndex(
                            task => task.id === updatedTask.id
                        );
                        if (taskIndex !== -1) {
                            tasks[taskIndex] = updatedTask;
                            setTasks([...tasks]);
                        }
                    }
                } catch (error) {
                    console.error('Failed to update task', error);
                } finally {
                    setEditingTask(null);
                }
            } else if (creatingTaskForList) {
                await createTask(taskData, creatingTaskForList);
            }
        },
        [editingTask, taskLists, createTask, creatingTaskForList]
    );

    const handleTaskFormCancel = useCallback(() => {
        setEditingTask(null);
        setCreatingTaskForList(null);
    }, []);

    const handleConfirmRemoveTask = useCallback(async () => {
        if (removingTask) {
            try {
                await taskService.deleteTask(removingTask.id!);

                const listName = removingTask.listName;
                const list = taskLists[listName];
                if (list) {
                    const tasks = list.taskList.tasks;
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
    }, [removingTask, taskLists]);

    const handleCancelRemoveTask = useCallback(() => {
        setRemovingTask(null);
    }, []);

    return (
        <TaskActionContext.Provider
            value={{
                openCreateTaskDialog,
                openEditTaskDialog,
                openRemoveTaskDialog,
                openTaskDetailsDialog,
                moveTask: handleMoveTask,
            }}
        >
            <TaskDetailsDialog
                open={!!showingDetailsTask}
                task={showingDetailsTask!}
                onClose={closeTaskDetailsDialog}
            />

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
