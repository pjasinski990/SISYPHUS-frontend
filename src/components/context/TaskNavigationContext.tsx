import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
} from 'react';
import { useAllTaskLists } from './TaskListsContext';
import { Task } from '../../service/taskService';
import { useTaskAction } from './TaskActionContext';

interface TaskNavigationContextType {
    highlightedTaskId: string | null;
    highlightedListName: string | null;
    clearHighlight: () => void;
    moveHighlight: (direction: 'h' | 'j' | 'k' | 'l') => void;
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
        setHighlightedListName(null);
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

            if (
                !highlightedListName ||
                !highlightedTaskId ||
                !visibleLists.includes(highlightedListName)
            ) {
                const firstList = visibleLists[0];
                const firstTask = tasksLists[firstList]?.tasks[0];
                setHighlightedListName(firstList);
                setHighlightedTaskId(firstTask ? firstTask.id : null);
                return;
            }

            const currentTaskList =
                tasksLists[highlightedListName]?.tasks || [];
            let currentTaskIndex = highlightedTaskId
                ? currentTaskList.findIndex(
                      task => task.id === highlightedTaskId
                  )
                : -1;

            if (currentTaskIndex === -1) {
                currentTaskIndex = 0;
            }

            let newHighlightedListName: string | null = highlightedListName;
            let newHighlightedTaskId: string | null = highlightedTaskId;

            switch (direction) {
                case 'h': {
                    const previousListName = getPreviousListName();
                    if (previousListName) {
                        newHighlightedListName = previousListName;
                        const newTaskList =
                            tasksLists[newHighlightedListName]?.tasks || [];
                        const clampedIndex = Math.min(
                            currentTaskIndex,
                            newTaskList.length - 1
                        );
                        newHighlightedTaskId = newTaskList[clampedIndex]?.id;
                    }
                    break;
                }
                case 'l': {
                    const nextListName = getNextListName();
                    if (nextListName) {
                        newHighlightedListName = nextListName;
                        const newTaskList =
                            tasksLists[newHighlightedListName]?.tasks || [];
                        const clampedIndex = Math.min(
                            currentTaskIndex,
                            newTaskList.length - 1
                        );
                        newHighlightedTaskId =
                            newTaskList[clampedIndex]?.id || null;
                    }
                    break;
                }
                case 'j': {
                    if (currentTaskIndex < currentTaskList.length - 1) {
                        newHighlightedTaskId =
                            currentTaskList[currentTaskIndex + 1]?.id || null;
                    }
                    break;
                }
                case 'k': {
                    if (currentTaskIndex > 0) {
                        newHighlightedTaskId =
                            currentTaskList[currentTaskIndex - 1]?.id || null;
                    }
                    break;
                }
                default:
                    break;
            }

            if (
                newHighlightedListName !== highlightedListName ||
                newHighlightedTaskId !== highlightedTaskId
            ) {
                setHighlightedListName(newHighlightedListName);
                setHighlightedTaskId(newHighlightedTaskId);
            }
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
        async (action: 'edit' | 'delete' | 'move-next' | 'move-prev' | 'show-details') => {
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
                case 'show-details':
                    taskActionContext.openTaskDetailsDialog(task);
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
                default:
                    break;
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

    useEffect(() => {
        if (
            highlightedListName &&
            !visibleLists.includes(highlightedListName)
        ) {
            if (visibleLists.length > 0) {
                const firstVisibleList = visibleLists[0];
                const firstTask = tasksLists[firstVisibleList]?.tasks[0];
                setHighlightedListName(firstVisibleList);
                setHighlightedTaskId(firstTask ? firstTask.id : null);
            } else {
                clearHighlight();
            }
        }
    }, [visibleLists, highlightedListName, tasksLists, clearHighlight]);

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
