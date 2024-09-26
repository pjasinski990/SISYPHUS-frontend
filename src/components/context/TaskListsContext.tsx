import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Task, taskService } from "../../service/taskService";

interface TaskListsProviderType {
    tasksLists: Record<string, Task[]>;
    setTaskList: (listName: string, tasks: Task[]) => void;
}

const TaskListsContext = createContext<TaskListsProviderType | undefined>(undefined);

export const TaskListsProvider: React.FC<{ children: React.ReactNode, listNames: string[] }> = ({ children, listNames }) => {
    const [tasksLists, setTasksLists] = useState<Record<string, Task[]>>({});

    const isMounted = useRef(true);
    useEffect(() => {
        return () => { isMounted.current = false };
    }, []);

    useEffect(() => {
        const fetchTasksForList = async (listName: string) => {
            try {
                const taskData = await taskService.getTasksList(listName);
                console.log(`Fetched tasks for list "${listName}": ${taskData.map(task => task.id).join(", ")}`);

                if (isMounted.current) {
                    setTasksLists(prev => ({
                        ...prev,
                        [listName]: taskData
                    }));
                }
            } catch (error) {
                console.error(`Error fetching tasks for list "${listName}":`, error);
            }
        };
        setTasksLists({});
        listNames.forEach(listName => {
            fetchTasksForList(listName).then();
        });

    }, [listNames]);

    const setTaskList = (listName: string, tasks: Task[]) => {
        setTasksLists(prev => ({
            ...prev,
            [listName]: tasks
        }));
    };

    const contextValue = useMemo(() => ({
        tasksLists,
        setTaskList,
    }), [tasksLists]);

    return (
        <TaskListsContext.Provider value={contextValue}>
            {children}
        </TaskListsContext.Provider>
    );
};

export const useTaskLists = (listName: string): { tasks: Task[]; setTasks: (tasks: Task[]) => void } => {
    const context = useContext(TaskListsContext);
    if (context === undefined) {
        throw new Error('useTaskLists must be used within a TaskListsProvider');
    }

    const { tasksLists, setTaskList } = context;
    const tasks = tasksLists[listName] || [];

    const setTasksForList = (tasks: Task[]) => {
        setTaskList(listName, tasks);
    };

    return { tasks, setTasks: setTasksForList };
};
