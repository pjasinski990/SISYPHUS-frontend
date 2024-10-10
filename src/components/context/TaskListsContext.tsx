import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { Task, taskService } from '../../service/taskService';
import { TaskList } from 'src/lib/taskList';

interface TaskListsProviderType {
    taskLists: TaskList[];
    setTaskList: (list: TaskList) => void;
    filters: Record<string, TaskFilter>;
    comparators: Record<string, TaskComparator>;
    setFilter: (listName: string, filter: TaskFilter) => void;
    setComparator: (listName: string, comparator: TaskComparator) => void;
    orderedListNames: string[];
}

export interface TaskListProviderType {
    taskList: TaskList;
    setTaskList: (list: TaskList) => void;
    setTasks: (tasks: Task[]) => void;
}

export interface TaskFilter {
    (task: Task): boolean;
}

export interface TaskComparator {
    (a: Task, b: Task): number;
}

interface TaskListsProviderProps {
    children: React.ReactNode;
    listNames: string[];
    initialTaskLists?: TaskList[]; // Added optional prop
}

const TaskListsContext = createContext<TaskListsProviderType | undefined>(
    undefined
);

const findOrEmpty = (taskLists: TaskList[], listName: string): TaskList => {
    const taskList = taskLists.find(list => list.name === listName);
    if (!taskList) {
        return { tasks: [], name: '', displayOrder: 0 };
    }
    return taskList;
};

const getSortedAndFiltered = (
    taskList: TaskList,
    filters: Record<string, TaskFilter>,
    comparators: Record<string, TaskComparator>
): TaskList => {
    const rawTasks = taskList.tasks;
    const filter = filters[taskList.name] || (() => true);
    const comparator = comparators[taskList.name];

    const filteredTasks = rawTasks.filter(filter);
    const sortedTasks = comparator
        ? [...filteredTasks].sort(comparator)
        : filteredTasks;

    return { ...taskList, tasks: sortedTasks };
};

export const TaskListsProvider: React.FC<TaskListsProviderProps> = ({
    children,
    listNames,
    initialTaskLists,
}) => {
    const [taskLists, setTaskLists] = useState<TaskList[]>(
        initialTaskLists || []
    );
    const [filters, setFilters] = useState<Record<string, TaskFilter>>({});
    const [comparators, setComparators] = useState<
        Record<string, TaskComparator>
    >({});

    const orderedListNames = useMemo(() => listNames, [listNames]);

    useEffect(() => {
        if (initialTaskLists) return; // Skip fetching if custom tasks are provided

        const fetchTasksForList = async (listName: string) => {
            try {
                const taskList = await taskService.getTasksList(listName);
                setTaskLists(prev => [...prev, taskList]);
            } catch (error) {
                console.error(
                    `Error fetching tasks for list "${listName}":`,
                    error
                );
            }
        };

        listNames.forEach(listName => {
            if (!taskLists.find(list => list.name === listName)) {
                fetchTasksForList(listName);
            }
        });
    }, [listNames, taskLists, initialTaskLists]);

    const setTaskList = useCallback((newList: TaskList) => {
        setTaskLists(prevLists => {
            const index = prevLists.findIndex(
                list => list.name === newList.name
            );
            if (index === -1) {
                return [...prevLists, newList];
            } else {
                return prevLists.map(list =>
                    list.name === newList.name ? newList : list
                );
            }
        });
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
            taskLists,
            setTaskList,
            filters,
            comparators,
            setFilter,
            setComparator,
            orderedListNames,
        }),
        [
            taskLists,
            setTaskList,
            filters,
            comparators,
            setFilter,
            setComparator,
            orderedListNames,
        ]
    );

    return (
        <TaskListsContext.Provider value={contextValue}>
            {children}
        </TaskListsContext.Provider>
    );
};

const useTaskListsContext = (): TaskListsProviderType => {
    const context = useContext(TaskListsContext);
    if (context === undefined) {
        throw new Error(
            'useTaskListsContext must be used within a TaskListsProvider'
        );
    }
    return context;
};

const useTaskListsInternal = (
    listNames: string[] | null
): Record<string, TaskListProviderType> => {
    const { taskLists, setTaskList, filters, comparators, orderedListNames } =
        useTaskListsContext();

    const targetListNames = listNames === null ? orderedListNames : listNames;

    return useMemo(() => {
        const result: Record<
            string,
            {
                taskList: TaskList;
                setTaskList: (list: TaskList) => void;
                setTasks: (tasks: Task[]) => void;
            }
        > = {};

        targetListNames.forEach(listName => {
            const taskList = findOrEmpty(taskLists, listName);
            const filteredSortedTaskList = getSortedAndFiltered(
                taskList,
                filters,
                comparators
            );

            const setTasks = (tasks: Task[]) => {
                setTaskList({ ...taskList, tasks });
            };

            result[listName] = {
                taskList: filteredSortedTaskList,
                setTaskList,
                setTasks,
            };
        });

        return result;
    }, [targetListNames, taskLists, setTaskList, filters, comparators]);
};

export const useTaskList = (listName: string): TaskListProviderType => {
    const lists = useTaskListsInternal([listName]);
    return lists[listName];
};

export const useTaskLists = (
    listNames: string[]
): Record<string, TaskListProviderType> => {
    return useTaskListsInternal(listNames);
};

export const useAllTaskLists = (): Record<string, TaskListProviderType> => {
    return useTaskListsInternal(null);
};

export const useListFilters = (): {
    setFilter: (listName: string, filter: TaskFilter) => void;
    filters: Record<string, TaskFilter>;
} => {
    const { setFilter, filters } = useTaskListsContext();
    return { setFilter, filters };
};

export const useListOrder = (): {
    setComparator: (listName: string, comparator: TaskComparator) => void;
    comparators: Record<string, TaskComparator>;
} => {
    const { setComparator, comparators } = useTaskListsContext();
    return { setComparator, comparators };
};
