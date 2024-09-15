import React, { createContext, useContext } from "react";
import { DraggableProvided, DraggableStateSnapshot } from "@hello-pangea/dnd";

interface DraggableContextType {
    provided: DraggableProvided;
    snapshot: DraggableStateSnapshot;
}

const DraggableContext = createContext<DraggableContextType | undefined>(undefined);

export const DraggableProvider: React.FC<{
    provided: DraggableProvided;
    snapshot: DraggableStateSnapshot;
    children: React.ReactNode
}> = ({ provided, snapshot, children }) => {

    return (
        <DraggableContext.Provider value={{ provided, snapshot }}>
            {children}
        </DraggableContext.Provider>
    );
};

export const useDraggable = () => {
    const context = useContext(DraggableContext);
    if (context === undefined) {
        throw new Error('useDraggable must be used within a DraggableProvider');
    }
    return context;
};
