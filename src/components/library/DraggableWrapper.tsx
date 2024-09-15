import React from "react";
import { useDraggable } from "src/components/context/DraggableContext";

interface DraggableWrapperProps {
    children: React.ReactNode;
    className?: string;
}

export const DraggableWrapper: React.FC<DraggableWrapperProps> = ({ children, className }) => {
    const { provided, snapshot } = useDraggable();

    const draggingClass = snapshot?.isDragging ? 'opacity-75' : '';

    return (
        <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`${className} ${draggingClass}`}
        >
            <div {...provided.dragHandleProps}>
                {children}
            </div>
        </div>
    );
};
