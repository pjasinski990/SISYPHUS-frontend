import { Task } from "../../service/taskService";
import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { TaskItemContent } from "src/components/task/TaskItemContent";
import { DraggableProvider } from "src/components/context/DraggableContext";
import { DraggableWrapper } from "src/components/library/DraggableWrapper";

interface DraggableTaskItemProps {
    task: Task;
    index: number;
}

export const DraggableTaskItem: React.FC<DraggableTaskItemProps> = ({ task, index }) => {
    return (
        <Draggable draggableId={String(task.id)} index={index}>
            {(provided, snapshot) => (
                <DraggableProvider provided={provided} snapshot={snapshot}>
                    <DraggableWrapper>
                        <TaskItemContent
                            task={task}
                        />
                    </DraggableWrapper>
                </DraggableProvider>
            )}
        </Draggable>
    );
};
