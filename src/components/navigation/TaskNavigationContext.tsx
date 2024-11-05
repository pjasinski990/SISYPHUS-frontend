import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { TaskListProviderType, useAllTaskLists } from '../context/TaskListsContext';
import { Task } from '../../service/taskService';
import { useTaskAction } from '../context/TaskActionContext';
import {
    getNextList,
    getNextNonEmptyList,
    getOrNull,
    getPrevList,
    getPrevNonEmptyList,
} from 'src/lib/taskNavigationHelper';
import { TaskList } from 'src/lib/taskList';
import { Movement } from './Movement';

type TaskActionHandler = (task: Task) => Promise<void> | void;

interface TaskNavigationContextType {
    highlightedTaskId: string | null;
    highlightedListName: string | null;
    clearHighlight: () => void;
    moveHighlight: (movement: Movement) => void;
    performAction: (actionName: string) => void;
    highlightedTask: Task | null;
    registerList: (listName: string, atFront: boolean) => void;
    unregisterList: (listName: string) => void;
    registerAction: (actionName: string, handler: TaskActionHandler) => void;
    unregisterAction: (actionName: string) => void;
}

const TaskNavigationContext = createContext<TaskNavigationContextType | undefined>(undefined);

export const TaskNavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
    const [highlightedListName, setHighlightedListName] = useState<string | null>(null);
    const [visibleLists, setVisibleLists] = useState<string[]>([]);

    const taskListProviders = useAllTaskLists();
    const taskActionContext = useTaskAction();

    const actionHandlersRef = useRef<{ [actionName: string]: TaskActionHandler }>({});

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

    const handleLeftMovement = useCallback(
        (currentTaskList: TaskList | null, currentTaskIndex: number) => {
            const prevList = getPrevNonEmptyList(
                currentTaskList,
                visibleLists.map(ln => taskListProviders[ln].taskList)
            );
            let newHighlightedList = currentTaskList;
            let newHighlightedTaskId = highlightedTaskId;
            if (prevList) {
                newHighlightedList = prevList;
                const clampedIndex = Math.min(
                    currentTaskIndex,
                    prevList.tasks.length - 1
                );
                newHighlightedTaskId =
                    prevList.tasks[clampedIndex]?.id || null;
            }
            return { newHighlightedList, newHighlightedTaskId };
        },
        [highlightedTaskId, visibleLists, taskListProviders]
    );

    const handleRightMovement = useCallback(
        (currentTaskList: TaskList | null, currentTaskIndex: number) => {
            const nextList = getNextNonEmptyList(
                currentTaskList,
                visibleLists.map(ln => taskListProviders[ln].taskList)
            );
            let newHighlightedList = currentTaskList;
            let newHighlightedTaskId = highlightedTaskId;
            if (nextList) {
                newHighlightedList = nextList;
                const clampedIndex = Math.min(
                    currentTaskIndex,
                    nextList.tasks.length - 1
                );
                newHighlightedTaskId =
                    nextList.tasks[clampedIndex]?.id || null;
            }
            return { newHighlightedList, newHighlightedTaskId };
        },
        [highlightedTaskId, visibleLists, taskListProviders]
    );

    const handleDownMovement = useCallback(
        (currentTaskList: TaskList | null, currentTaskIndex: number) => {
            const newHighlightedList = currentTaskList;
            let newHighlightedTaskId = highlightedTaskId;
            if (
                currentTaskList &&
                currentTaskIndex < currentTaskList.tasks.length - 1
            ) {
                newHighlightedTaskId =
                    currentTaskList.tasks[currentTaskIndex + 1]?.id ||
                    null;
            }
            return { newHighlightedList, newHighlightedTaskId };
        },
        [highlightedTaskId]
    );

    const handleUpMovement = useCallback(
        (currentTaskList: TaskList | null, currentTaskIndex: number) => {
            const newHighlightedList = currentTaskList;
            let newHighlightedTaskId = highlightedTaskId;
            if (currentTaskList && currentTaskIndex > 0) {
                newHighlightedTaskId =
                    currentTaskList.tasks[currentTaskIndex - 1]?.id ||
                    null;
            }
            return { newHighlightedList, newHighlightedTaskId };
        },
        [highlightedTaskId]
    );

    const handleAllUpMovement = useCallback(
        (currentTaskList: TaskList | null) => {
            const newHighlightedList = currentTaskList;
            let newHighlightedTaskId = highlightedTaskId;
            if (currentTaskList && currentTaskList.tasks.length > 0) {
                newHighlightedTaskId =
                    currentTaskList.tasks[0]?.id ||
                    null;
            }
            return { newHighlightedList, newHighlightedTaskId };
        },
        [highlightedTaskId]
    );

    const handleAllDownMovement = useCallback(
        (currentTaskList: TaskList | null) => {
            const newHighlightedList = currentTaskList;
            let newHighlightedTaskId = highlightedTaskId;
            if (currentTaskList && currentTaskList.tasks.length > 0) {
                newHighlightedTaskId =
                    currentTaskList.tasks[currentTaskList.tasks.length - 1]?.id ||
                    null;
            }
            return { newHighlightedList, newHighlightedTaskId };
        },
        [highlightedTaskId]
    );

    const moveHighlight = useCallback(
        (movement: Movement) => {
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

            switch (movement) {
                case Movement.LEFT: {
                    const result = handleLeftMovement(currentTaskList, currentTaskIndex);
                    newHighlightedList = result.newHighlightedList;
                    newHighlightedTaskId = result.newHighlightedTaskId;
                    break;
                }
                case Movement.RIGHT: {
                    const result = handleRightMovement(currentTaskList, currentTaskIndex);
                    newHighlightedList = result.newHighlightedList;
                    newHighlightedTaskId = result.newHighlightedTaskId;
                    break;
                }
                case Movement.DOWN: {
                    const result = handleDownMovement(currentTaskList, currentTaskIndex);
                    newHighlightedList = result.newHighlightedList;
                    newHighlightedTaskId = result.newHighlightedTaskId;
                    break;
                }
                case Movement.UP: {
                    const result = handleUpMovement(currentTaskList, currentTaskIndex);
                    newHighlightedList = result.newHighlightedList;
                    newHighlightedTaskId = result.newHighlightedTaskId;
                    break;
                }
                case Movement.ALL_UP: {
                    const result = handleAllUpMovement(currentTaskList);
                    newHighlightedList = result.newHighlightedList;
                    newHighlightedTaskId = result.newHighlightedTaskId;
                    break;
                }
                case Movement.ALL_DOWN: {
                    const result = handleAllDownMovement(currentTaskList);
                    newHighlightedList = result.newHighlightedList;
                    newHighlightedTaskId = result.newHighlightedTaskId;
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
            handleLeftMovement,
            handleRightMovement,
            handleUpMovement,
            handleDownMovement,
            handleAllUpMovement,
            handleAllDownMovement,
        ]
    );

    const registerAction = useCallback((actionName: string, handler: TaskActionHandler) => {
        actionHandlersRef.current[actionName] = handler;
    }, []);

    const unregisterAction = useCallback((actionName: string) => {
        delete actionHandlersRef.current[actionName];
    }, []);

    const performAction = useCallback(
        async (actionName: string) => {
            if (!highlightedTaskId || !highlightedListName) {
                return;
            }
            const task = taskListProviders[highlightedListName]?.taskList.tasks.find(
                t => t.id === highlightedTaskId
            );
            if (!task) {
                return;
            }
            const handler = actionHandlersRef.current[actionName];
            if (handler) {
                await handler(task);
            } else {
                console.warn(`No handler registered for action: ${actionName}`);
            }
        },
        [highlightedTaskId, highlightedListName, taskListProviders]
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

    useEffect(() => {
        registerAction('edit', task => taskActionContext.openEditTaskDialog(task));
        registerAction('delete', task => taskActionContext.openRemoveTaskDialog(task));
        registerAction('show-details', task => taskActionContext.openTaskDetailsDialog(task));
        registerAction('show-unravel', task => taskActionContext.openUnravelTaskDialog(task));

        registerAction('move-next', async task => {
            const currentTaskList: TaskList | null =
                taskListProviders[highlightedListName!]?.taskList || null;
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
        });

        registerAction('move-prev', async task => {
            const currentTaskList: TaskList | null =
                taskListProviders[highlightedListName!]?.taskList || null;
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
        });

        return () => {
            unregisterAction('edit');
            unregisterAction('delete');
            unregisterAction('show-details');
            unregisterAction('show-unravel');
            unregisterAction('move-next');
            unregisterAction('move-prev');
        };
    }, [
        registerAction,
        unregisterAction,
        taskActionContext,
        highlightedListName,
        taskListProviders,
        visibleLists,
    ]);

    const value: TaskNavigationContextType = {
        highlightedTaskId,
        highlightedListName,
        clearHighlight,
        moveHighlight,
        performAction,
        highlightedTask,
        registerList,
        unregisterList,
        registerAction,
        unregisterAction,
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
