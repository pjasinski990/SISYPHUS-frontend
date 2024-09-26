import React, { createContext, useContext } from "react";

interface TaskPropertiesContextType {
    isDraggable: boolean;
    isFoldable: boolean;
}

const TaskPropertiesContext = createContext<TaskPropertiesContextType | undefined>(undefined);

export const TaskPropertiesProvider: React.FC<{
    isDraggable: boolean;
    isFoldable: boolean;
    children: React.ReactNode
}> = ({ isDraggable, isFoldable, children }) => {
    return (
        <TaskPropertiesContext.Provider value={{ isDraggable, isFoldable }}>
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
