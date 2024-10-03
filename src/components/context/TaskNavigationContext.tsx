import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAllTaskLists } from './TaskListsContext';
import { Task } from '../../service/taskService';
import { useTaskAction } from './TaskActionContext';

interface TaskNavigationContextType {
    highlightedTaskId: string | null;
    highlightedListName: string | null;
    clearHighlight: () => void;
    moveHighlight: (direction: 'h' | 'j' | 'k' | 'l') => void;
    performAction: (action: 'edit' | 'delete' | 'move') => void;
    highlightedTask: Task | null;
    registerList: (listName: string) => void;
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

    const registerList = useCallback((listName: string) => {
        setVisibleLists(prev => {
            if (!prev.includes(listName)) {
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

    const moveHighlight = useCallback(
        (direction: 'h' | 'j' | 'k' | 'l') => {
            if (visibleLists.length === 0) {
                return;
            }

            const currentListIndex = highlightedListName
                ? visibleLists.indexOf(highlightedListName)
                : 0;
            let currentTaskList = highlightedListName
                ? tasksLists[highlightedListName]?.tasks || []
                : [];
            let currentTaskIndex = highlightedTaskId
                ? currentTaskList.findIndex(
                      task => task.id === highlightedTaskId
                  )
                : -1;

            let newHighlightedListName = highlightedListName;
            let newHighlightedTaskId = highlightedTaskId;

            switch (direction) {
                case 'h':
                    if (currentListIndex > 0) {
                        newHighlightedListName =
                            visibleLists[currentListIndex - 1];
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
                    if (currentListIndex < visibleLists.length - 1) {
                        newHighlightedListName =
                            visibleLists[currentListIndex + 1];
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
        [highlightedListName, highlightedTaskId, tasksLists, visibleLists]
    );

    const performAction = useCallback(
        async (action: 'edit' | 'delete' | 'move') => {
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
                case 'move':
                    // TODO move
                    break;
            }
        },
        [highlightedTaskId, highlightedListName, tasksLists, taskActionContext]
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
