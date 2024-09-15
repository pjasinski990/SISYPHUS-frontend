import React, { createContext, useContext } from "react";
import { Task } from "../../service/taskService";

interface TaskPropertiesContextType {
    onTaskEdit: (task: Task) => void;
    onTaskRemove: (task: Task) => void;
    isDraggable: boolean;
    isFoldable: boolean;
}

const TaskPropertiesContext = createContext<TaskPropertiesContextType | undefined>(undefined);

export const TaskPropertiesProvider: React.FC<{
    onTaskEdit: (task: Task) => void;
    onTaskRemove: (task: Task) => void;
    isDraggable: boolean;
    isFoldable: boolean;
    children: React.ReactNode
}> = ({ onTaskEdit, onTaskRemove, isDraggable, isFoldable, children }) => {
    return (
        <TaskPropertiesContext.Provider value={{ onTaskEdit, onTaskRemove: onTaskRemove, isDraggable, isFoldable }}>
            {children}
        </TaskPropertiesContext.Provider>
    );
};

export const useTaskProperties = () => {
    const context = useContext(TaskPropertiesContext);
    if (context === undefined) {
        throw new Error('useTaskProperties must be used within a TaskPropertiesProvider');
    }
    return context;
};
