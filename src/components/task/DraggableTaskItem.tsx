import { Task } from "../../service/taskService";
import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { categoryColors, categoryHoverColors, TaskItemContent } from "src/components/task/TaskItemContent";

interface DraggableTaskItemProps {
    task: Task;
    index: number;
    onEditTask: (task: Task) => void;
    onRemoveTask: (task: Task) => void;
}

export const DraggableTaskItem: React.FC<DraggableTaskItemProps> = ({ task, index, onEditTask, onRemoveTask }) => {
    const categoryClass = categoryColors[task.category];
    const categoryEditButtonClass = categoryHoverColors[task.category];

    return (
        <Draggable draggableId={String(task.id)} index={index}>
            {(provided, snapshot) => (
                <TaskItemContent
                    task={task}
                    onEditTask={onEditTask}
                    onRemoveTask={onRemoveTask}
                    categoryClass={categoryClass}
                    categoryEditButtonClass={categoryEditButtonClass}
                    provided={provided}
                    snapshot={snapshot}
                />
            )}
        </Draggable>
    );
};
