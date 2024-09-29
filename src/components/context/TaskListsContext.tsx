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
    filters: Record<string, TaskFilter>;
    comparators: Record<string, TaskComparator>;
    setFilter: (listName: string, filter: TaskFilter) => void;
    setComparator: (listName: string, comparator: TaskComparator) => void;
}

const TaskListsContext = createContext<TaskListsProviderType | undefined>(
    undefined
);

export interface TaskFilter {
    (task: Task): boolean;
}

export interface TaskComparator {
    (a: Task, b: Task): number;
}

interface TaskListsProviderProps {
    children: React.ReactNode;
    listNames: string[];
}

export const TaskListsProvider: React.FC<TaskListsProviderProps> = ({
    children,
    listNames,
}) => {
    const [tasksLists, setTasksLists] = useState<Record<string, Task[]>>({});
    const [filters, setFilters] = useState<Record<string, TaskFilter>>({});
    const [comparators, setComparators] = useState<
        Record<string, TaskComparator>
    >({});

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
                fetchTasksForList(listName);
            }
        });
    }, [listNames, tasksLists]);

    const setTaskList = useCallback((listName: string, tasks: Task[]) => {
        setTasksLists(prev => ({
            ...prev,
            [listName]: tasks,
        }));
    }, []);

    const setFilter = useCallback((listName: string, filter: TaskFilter) => {
        setFilters(prev => ({
            ...prev,
            [listName]: filter,
        }));
    }, []);

    const setComparator = useCallback(
        (listName: string, comparator: TaskComparator) => {
            setComparators(prev => ({
                ...prev,
                [listName]: comparator,
            }));
        },
        []
    );

    const contextValue = useMemo(
        () => ({
            tasksLists,
            setTaskList,
            filters,
            comparators,
            setFilter,
            setComparator,
        }),
        [
            tasksLists,
            setTaskList,
            filters,
            comparators,
            setFilter,
            setComparator,
        ]
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

    const { tasksLists, setTaskList, filters, comparators } = context;
    const rawTasks = tasksLists[listName] || [];

    const filteredTasks = useMemo(() => {
        const filter = filters[listName];
        return filter ? rawTasks.filter(filter) : rawTasks;
    }, [rawTasks, filters, listName]);

    const sortedTasks = useMemo(() => {
        const comparator = comparators[listName];
        return comparator ? [...filteredTasks].sort(comparator) : filteredTasks;
    }, [filteredTasks, comparators, listName]);

    const setTasksForList = useCallback(
        (tasks: Task[]) => {
            setTaskList(listName, tasks);
        },
        [listName, setTaskList]
    );

    return { tasks: sortedTasks, setTasks: setTasksForList };
};

export const useTaskLists = (
    listNames: string[]
): Record<string, { tasks: Task[]; setTasks: (tasks: Task[]) => void }> => {
    const context = useContext(TaskListsContext);
    if (context === undefined) {
        throw new Error('useTaskLists must be used within a TaskListsProvider');
    }

    const { tasksLists, setTaskList, filters, comparators } = context;

    return useMemo(() => {
        const result: Record<
            string,
            { tasks: Task[]; setTasks: (tasks: Task[]) => void }
        > = {};
        listNames.forEach(listName => {
            const rawTasks = tasksLists[listName] || [];

            const filteredTasks = filters[listName]
                ? rawTasks.filter(filters[listName])
                : rawTasks;

            const sortedTasks = comparators[listName]
                ? [...filteredTasks].sort(comparators[listName])
                : filteredTasks;

            result[listName] = {
                tasks: sortedTasks,
                setTasks: (tasks: Task[]) => setTaskList(listName, tasks),
            };
        });
        return result;
    }, [listNames, tasksLists, setTaskList, filters, comparators]);
};

export const useListFilters = (): {
    setFilter: (listName: string, filter: TaskFilter) => void;
    filters: Record<string, TaskFilter>;
} => {
    const context = useContext(TaskListsContext);
    if (context === undefined) {
        throw new Error(
            'useListFilters must be used within a TaskListsProvider'
        );
    }

    const { setFilter, filters } = context;

    return { setFilter, filters };
};

export const useListOrder = (): {
    setComparator: (listName: string, comparator: TaskComparator) => void;
    comparators: Record<string, TaskComparator>;
} => {
    const context = useContext(TaskListsContext);
    if (context === undefined) {
        throw new Error('useListOrder must be used within a TaskListsProvider');
    }

    const { setComparator, comparators } = context;

    return { setComparator, comparators };
};
