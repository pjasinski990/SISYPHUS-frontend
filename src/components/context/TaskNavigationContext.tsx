import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
} from 'react';
import { TaskListProviderType, useAllTaskLists } from './TaskListsContext';
import { Task } from '../../service/taskService';
import { useTaskAction } from './TaskActionContext';
import {
    getNextList,
    getNextNonEmptyList,
    getOrNull,
    getPrevList,
    getPrevNonEmptyList,
} from 'src/lib/taskNavigationHelper';
import { TaskList } from 'src/lib/taskList';

interface TaskNavigationContextType {
    highlightedTaskId: string | null;
    highlightedListName: string | null;
    clearHighlight: () => void;
    moveHighlight: (direction: 'left' | 'down' | 'up' | 'right') => void;
    performAction: (
        action: 'edit' | 'delete' | 'move-next' | 'move-prev' | 'show-details'
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

    const taskListProviders = useAllTaskLists();
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

    const isTaskHighlighted = useCallback(() => {
        return (
            highlightedListName &&
            highlightedTaskId &&
            visibleLists.includes(highlightedListName)
        );
    }, [highlightedListName, highlightedTaskId, visibleLists]);

    const applyHighlightToFirstTask = useCallback(() => {
        const currentList = highlightedListName
            ? taskListProviders[highlightedListName].taskList
            : getNextNonEmptyList(
                  null,
                  visibleLists.map(ln => taskListProviders[ln].taskList)
              );
        const firstTask = currentList ? currentList.tasks[0] : null;
        setHighlightedListName(currentList?.name || null);
        setHighlightedTaskId(firstTask?.id || null);
    }, [highlightedListName, taskListProviders, visibleLists]);

    const moveHighlight = useCallback(
        (direction: 'left' | 'down' | 'up' | 'right') => {
            if (visibleLists.length === 0) {
                return;
            }

            const currentTaskList =
                getOrNull<TaskListProviderType>(
                    highlightedListName,
                    taskListProviders
                )?.taskList || null;

            if (!isTaskHighlighted()) {
                applyHighlightToFirstTask();
                return;
            }

            const currentTaskIndex = currentTaskList
                ? currentTaskList.tasks.findIndex(
                      task => task.id === highlightedTaskId
                  )
                : -1;

            let newHighlightedList: TaskList | null = currentTaskList;
            let newHighlightedTaskId: string | null = highlightedTaskId;

            switch (direction) {
                case 'left': {
                    const prevList = getPrevNonEmptyList(
                        currentTaskList,
                        visibleLists.map(ln => taskListProviders[ln].taskList)
                    );
                    if (prevList) {
                        newHighlightedList = prevList;
                        const clampedIndex = Math.min(
                            currentTaskIndex,
                            prevList.tasks.length - 1
                        );
                        newHighlightedTaskId =
                            prevList.tasks[clampedIndex]?.id || null;
                    }
                    break;
                }
                case 'right': {
                    const nextList = getNextNonEmptyList(
                        currentTaskList,
                        visibleLists.map(ln => taskListProviders[ln].taskList)
                    );
                    if (nextList) {
                        newHighlightedList = nextList;
                        const clampedIndex = Math.min(
                            currentTaskIndex,
                            nextList.tasks.length - 1
                        );
                        newHighlightedTaskId =
                            nextList.tasks[clampedIndex]?.id || null;
                    }
                    break;
                }
                case 'down': {
                    if (
                        currentTaskList &&
                        currentTaskIndex < currentTaskList.tasks.length - 1
                    ) {
                        newHighlightedTaskId =
                            currentTaskList.tasks[currentTaskIndex + 1]?.id ||
                            null;
                    }
                    break;
                }
                case 'up': {
                    if (currentTaskList && currentTaskIndex > 0) {
                        newHighlightedTaskId =
                            currentTaskList.tasks[currentTaskIndex - 1]?.id ||
                            null;
                    }
                    break;
                }
                default:
                    break;
            }

            if (
                (newHighlightedList &&
                    newHighlightedList.name !== highlightedListName) ||
                newHighlightedTaskId !== highlightedTaskId
            ) {
                setHighlightedListName(newHighlightedList?.name || null);
                setHighlightedTaskId(newHighlightedTaskId);
            }
        },
        [
            applyHighlightToFirstTask,
            highlightedListName,
            highlightedTaskId,
            isTaskHighlighted,
            taskListProviders,
            visibleLists,
        ]
    );

    const performAction = useCallback(
        async (
            action:
                | 'edit'
                | 'delete'
                | 'move-next'
                | 'move-prev'
                | 'show-details'
        ) => {
            if (!highlightedTaskId || !highlightedListName) {
                return;
            }
            const task = taskListProviders[
                highlightedListName
            ]?.taskList.tasks.find(t => t.id === highlightedTaskId);

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
                case 'show-details':
                    taskActionContext.openTaskDetailsDialog(task);
                    break;
                case 'move-next': {
                    const currentTaskList: TaskList | null =
                        taskListProviders[highlightedListName]?.taskList ||
                        null;
                    const nextList = getNextList(
                        currentTaskList,
                        visibleLists.map(ln => taskListProviders[ln].taskList)
                    );
                    if (nextList) {
                        const movedTask = await taskActionContext.moveTask(
                            task,
                            nextList.name
                        );
                        if (movedTask) {
                            setHighlightedListName(nextList.name);
                            setHighlightedTaskId(movedTask.id);
                        }
                    }
                    break;
                }
                case 'move-prev': {
                    const currentTaskList: TaskList | null =
                        taskListProviders[highlightedListName]?.taskList ||
                        null;
                    const prevList = getPrevList(
                        currentTaskList,
                        visibleLists.map(ln => taskListProviders[ln].taskList)
                    );
                    if (prevList) {
                        const movedTask = await taskActionContext.moveTask(
                            task,
                            prevList.name
                        );
                        if (movedTask) {
                            setHighlightedListName(prevList.name);
                            setHighlightedTaskId(movedTask.id);
                        }
                    }
                    break;
                }
                default:
                    break;
            }
        },
        [
            highlightedTaskId,
            highlightedListName,
            taskListProviders,
            taskActionContext,
            visibleLists,
        ]
    );

    const highlightedTask =
        highlightedTaskId && highlightedListName
            ? taskListProviders[highlightedListName]?.taskList.tasks.find(
                  t => t.id === highlightedTaskId
              ) || null
            : null;

    useEffect(() => {
        if (
            highlightedListName &&
            !visibleLists.includes(highlightedListName)
        ) {
            if (visibleLists.length > 0) {
                const firstVisibleList = getNextNonEmptyList(
                    null,
                    visibleLists.map(ln => taskListProviders[ln].taskList)
                );
                const firstTask = firstVisibleList
                    ? firstVisibleList.tasks[0]
                    : null;
                setHighlightedListName(firstVisibleList?.name || null);
                setHighlightedTaskId(firstTask ? firstTask.id : null);
            } else {
                clearHighlight();
            }
        }
    }, [visibleLists, highlightedListName, taskListProviders, clearHighlight]);

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
