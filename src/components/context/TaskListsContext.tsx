import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Task, taskService } from '../../service/taskService';

interface TaskListsProviderType {
    tasksLists: Record<string, Task[]>;
    setTaskList: (listName: string, tasks: Task[]) => void;
}

const TaskListsContext = createContext<TaskListsProviderType | undefined>(
    undefined
);

interface TaskListsProviderProps {
    children: React.ReactNode;
    listNames: string[];
}

export const TaskListsProvider: React.FC<TaskListsProviderProps> = ({
    children,
    listNames,
}) => {
    const [tasksLists, setTasksLists] = useState<Record<string, Task[]>>({});

    const isMounted = useRef(true);
    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        const fetchTasksForList = async (listName: string) => {
            try {
                const taskData = await taskService.getTasksList(listName);
                if (isMounted.current) {
                    setTasksLists(prev => ({
                        ...prev,
                        [listName]: taskData,
                    }));
                }
            } catch (error) {
                console.error(
                    `Error fetching tasks for list "${listName}":`,
                    error
                );
            }
        };

        listNames.forEach(listName => {
            if (!tasksLists[listName]) {
                fetchTasksForList(listName).then();
            }
        });
    }, [listNames, tasksLists]);

    const setTaskList = useCallback((listName: string, tasks: Task[]) => {
        setTasksLists(prev => ({
            ...prev,
            [listName]: tasks,
        }));
    }, []);

    const contextValue = useMemo(
        () => ({
            tasksLists,
            setTaskList,
        }),
        [tasksLists, setTaskList]
    );

    return (
        <TaskListsContext.Provider value={contextValue}>
            {children}
        </TaskListsContext.Provider>
    );
};

export const useTaskList = (
    listName: string
): { tasks: Task[]; setTasks: (tasks: Task[]) => void } => {
    const context = useContext(TaskListsContext);
    if (context === undefined) {
        throw new Error('useTaskList must be used within a TaskListsProvider');
    }

    const { tasksLists, setTaskList } = context;
    const tasks = tasksLists[listName] || [];

    const setTasksForList = useCallback(
        (tasks: Task[]) => {
            setTaskList(listName, tasks);
        },
        [listName, setTaskList]
    );

    return { tasks, setTasks: setTasksForList };
};

export const useTaskLists = (
    listNames: string[]
): Record<string, { tasks: Task[]; setTasks: (tasks: Task[]) => void }> => {
    const context = useContext(TaskListsContext);
    if (context === undefined) {
        throw new Error('useTaskLists must be used within a TaskListsProvider');
    }

    const { tasksLists, setTaskList } = context;

    return useMemo(() => {
        const result: Record<
            string,
            { tasks: Task[]; setTasks: (tasks: Task[]) => void }
        > = {};
        listNames.forEach(listName => {
            const tasks = tasksLists[listName] || [];
            result[listName] = {
                tasks,
                setTasks: (tasks: Task[]) => setTaskList(listName, tasks),
            };
        });
        return result;
    }, [listNames, tasksLists, setTaskList]);
};
