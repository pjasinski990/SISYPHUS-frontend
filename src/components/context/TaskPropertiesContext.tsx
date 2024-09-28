import React, { createContext, useContext } from 'react';

interface TaskPropertiesContextType {
    isDraggable: boolean;
    isFoldable: boolean;
    initiallyFolded: boolean;
}

const TaskPropertiesContext = createContext<
    TaskPropertiesContextType | undefined
>(undefined);

export const TaskPropertiesProvider: React.FC<{
    isDraggable: boolean;
    isFoldable: boolean;
    initiallyFolded?: boolean;
    children: React.ReactNode;
}> = ({ isDraggable, isFoldable, initiallyFolded = false, children }) => {
    return (
        <TaskPropertiesContext.Provider
            value={{ isDraggable, isFoldable, initiallyFolded }}
        >
            {children}
        </TaskPropertiesContext.Provider>
    );
};

export const useTaskProperties = () => {
    const context = useContext(TaskPropertiesContext);
    if (context === undefined) {
        throw new Error(
            'useTaskProperties must be used within a TaskPropertiesProvider'
        );
    }
    return context;
};
