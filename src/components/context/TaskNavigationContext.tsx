import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAllTaskLists } from './TaskListsContext';
import { Task } from '../../service/taskService';
import { useTaskAction } from './TaskActionContext';

interface TaskNavigationContextType {
    highlightedTaskId: string | null;
    highlightedListName: string | null;
    clearHighlight: () => void;
    moveHighlight: (direction: 'h' | 'j' | 'k' | 'l') => void;
    performAction: (
        action: 'edit' | 'delete' | 'move-next' | 'move-prev'
    ) => void;
    highlightedTask: Task | null;
    registerList: (listName: string, atFront: boolean) => void;
    unregisterList: (listName: string) => void;
}

const TaskNavigationContext = createContext<
    TaskNavigationContextType | undefined
>(undefined);

export const TaskNavigationProvider: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(
        null
    );
    const [highlightedListName, setHighlightedListName] = useState<
        string | null
    >(null);
    const [visibleLists, setVisibleLists] = useState<string[]>([]);

    const tasksLists = useAllTaskLists();
    const taskActionContext = useTaskAction();

    const registerList = useCallback((listName: string, atFront: boolean) => {
        setVisibleLists(prev => {
            if (!prev.includes(listName)) {
                if (atFront) {
                    return [listName, ...prev];
                }
                return [...prev, listName];
            }
            return prev;
        });
    }, []);

    const unregisterList = useCallback((listName: string) => {
        setVisibleLists(prev => prev.filter(name => name !== listName));
    }, []);

    const clearHighlight = useCallback(() => {
        setHighlightedTaskId(null);
    }, []);

    const getNextListName = useCallback((): string | null => {
        if (!highlightedListName) {
            return visibleLists.length > 0 ? visibleLists[0] : null;
        }
        const currentIndex = visibleLists.indexOf(highlightedListName);
        if (currentIndex === -1 || currentIndex >= visibleLists.length - 1) {
            return null;
        }
        return visibleLists[currentIndex + 1];
    }, [highlightedListName, visibleLists]);

    const getPreviousListName = useCallback((): string | null => {
        if (!highlightedListName) {
            return visibleLists.length > 0 ? visibleLists[0] : null;
        }
        const currentIndex = visibleLists.indexOf(highlightedListName);
        if (currentIndex <= 0) {
            return null;
        }
        return visibleLists[currentIndex - 1];
    }, [highlightedListName, visibleLists]);

    const moveHighlight = useCallback(
        (direction: 'h' | 'j' | 'k' | 'l') => {
            if (visibleLists.length === 0) {
                return;
            }

            let newHighlightedListName = highlightedListName;
            let newHighlightedTaskId = highlightedTaskId;

            if (
                !highlightedListName ||
                !highlightedTaskId ||
                !visibleLists.includes(highlightedListName)
            ) {
                newHighlightedListName = visibleLists[0];
                const firstTask = tasksLists[newHighlightedListName]?.tasks[0];
                newHighlightedTaskId = firstTask ? firstTask.id : null;
                setHighlightedListName(newHighlightedListName);
                setHighlightedTaskId(newHighlightedTaskId);
                return;
            }

            let currentTaskList = tasksLists[highlightedListName]?.tasks || [];
            let currentTaskIndex = highlightedTaskId
                ? currentTaskList.findIndex(
                      task => task.id === highlightedTaskId
                  )
                : -1;

            switch (direction) {
                case 'h':
                    newHighlightedListName = getPreviousListName();
                    if (newHighlightedListName) {
                        currentTaskList =
                            tasksLists[newHighlightedListName]?.tasks || [];
                        currentTaskIndex = Math.min(
                            currentTaskIndex,
                            currentTaskList.length - 1
                        );
                        newHighlightedTaskId =
                            currentTaskList[currentTaskIndex]?.id || null;
                    }
                    break;
                case 'l':
                    newHighlightedListName = getNextListName();
                    if (newHighlightedListName) {
                        currentTaskList =
                            tasksLists[newHighlightedListName]?.tasks || [];
                        currentTaskIndex = Math.min(
                            currentTaskIndex,
                            currentTaskList.length - 1
                        );
                        newHighlightedTaskId =
                            currentTaskList[currentTaskIndex]?.id || null;
                    }
                    break;
                case 'j':
                    if (currentTaskIndex < currentTaskList.length - 1) {
                        newHighlightedTaskId =
                            currentTaskList[currentTaskIndex + 1]?.id || null;
                    }
                    break;
                case 'k':
                    if (currentTaskIndex > 0) {
                        newHighlightedTaskId =
                            currentTaskList[currentTaskIndex - 1]?.id || null;
                    }
                    break;
            }

            setHighlightedListName(newHighlightedListName);
            setHighlightedTaskId(newHighlightedTaskId);
        },
        [
            highlightedListName,
            highlightedTaskId,
            tasksLists,
            visibleLists,
            getNextListName,
            getPreviousListName,
        ]
    );

    const performAction = useCallback(
        async (action: 'edit' | 'delete' | 'move-next' | 'move-prev') => {
            if (!highlightedTaskId || !highlightedListName) {
                return;
            }
            const task = tasksLists[highlightedListName]?.tasks.find(
                t => t.id === highlightedTaskId
            );

            if (!task) {
                return;
            }

            switch (action) {
                case 'edit':
                    taskActionContext.openEditTaskDialog(task);
                    break;
                case 'delete':
                    taskActionContext.openRemoveTaskDialog(task);
                    break;
                case 'move-next': {
                    const nextListName = getNextListName();
                    if (nextListName) {
                        taskActionContext.moveTask(task, nextListName);
                        setHighlightedListName(nextListName);
                        setHighlightedTaskId(task.id);
                    }
                    break;
                }
                case 'move-prev': {
                    const previousListName = getPreviousListName();
                    if (previousListName) {
                        taskActionContext.moveTask(task, previousListName);
                        setHighlightedListName(previousListName);
                        setHighlightedTaskId(task.id);
                    }
                    break;
                }
            }
        },
        [
            highlightedTaskId,
            highlightedListName,
            tasksLists,
            taskActionContext,
            getNextListName,
            getPreviousListName,
        ]
    );

    const highlightedTask =
        highlightedTaskId && highlightedListName
            ? tasksLists[highlightedListName]?.tasks.find(
                  t => t.id === highlightedTaskId
              ) || null
            : null;

    const value: TaskNavigationContextType = {
        highlightedTaskId,
        highlightedListName,
        clearHighlight,
        moveHighlight,
        performAction,
        highlightedTask,
        registerList,
        unregisterList,
    };

    return (
        <TaskNavigationContext.Provider value={value}>
            {children}
        </TaskNavigationContext.Provider>
    );
};

export const useTaskNavigation = () => {
    const context = useContext(TaskNavigationContext);
    if (!context) {
        throw new Error(
            'useTaskNavigation must be used within a TaskNavigationProvider'
        );
    }
    return context;
};
