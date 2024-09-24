import React, { createContext, useContext, ReactNode } from "react";
import { Task } from "../../service/taskService";
import { LucideIcon } from "lucide-react";

export interface TaskExtensionButton {
    icon: LucideIcon;
    handler: (task: Task) => void;
}

interface TaskExtensionContextValue {
    extraButtons: TaskExtensionButton[];
}

const TaskExtensionContext = createContext<TaskExtensionContextValue>({
    extraButtons: [],
});

interface TaskExtensionProviderProps {
    children: ReactNode;
    extraButtons?: TaskExtensionButton[];
}

export const TaskExtensionProvider: React.FC<TaskExtensionProviderProps> = ({
                                                                                children,
                                                                                extraButtons = [],
                                                                            }) => {
    return (
        <TaskExtensionContext.Provider value={{ extraButtons }}>
            {children}
        </TaskExtensionContext.Provider>
    );
};

export const useTaskExtensions = () => useContext(TaskExtensionContext);
