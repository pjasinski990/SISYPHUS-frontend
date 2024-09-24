import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { TaskFormData } from "src/components/task/TaskForm";
import { Task } from "../../service/taskService";

interface InboxContextType {
    inboxTasks: Task[],
    onRemoveTask: (taskId: string) => Promise<void>;
    onCreateTask: (task: TaskFormData) => void;
    onEditTask: (taskId: string, updatedTaskData: TaskFormData) => Promise<void>;
}

const InboxContext = createContext<InboxContextType | undefined>(undefined);

export const InboxTasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [inboxTasks, setInboxTasks] = useState<Task[]>([]);


    const createTask = useCallback(async (taskData: TaskFormData) => {

    }, []);

    const editTask = useCallback(async (taskId: string, taskData: TaskFormData) => {

    }, []);

    const removeTask = useCallback(async (taskId: string) => {

    }, []);

    const contextValue = useMemo(() => ({
        inboxTasks,
        onCreateTask: createTask,
        onEditTask: editTask,
        onRemoveTask: removeTask,
    }), [inboxTasks, createTask, editTask, removeTask]);

    return (
        <InboxContext.Provider value={contextValue}>
            {children}
        </InboxContext.Provider>
    );
};

export const useInbox = () => {
    const context = useContext(InboxContext);
    if (context === undefined) {
        throw new Error('useInbox must be used within an InboxTasksProvider');
    }
    return context;
};
