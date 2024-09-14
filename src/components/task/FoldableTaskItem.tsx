import { Task } from "../../service/taskService";
import React from "react";
import { categoryColors, categoryHoverColors, TaskItemContent } from "src/components/task/TaskItemContent";

interface FoldingTaskItemProps {
    task: Task;
    onEditTask: (task: Task) => void;
}

export const FoldingTaskItem: React.FC<FoldingTaskItemProps> = ({ task, onEditTask }) => {
    const categoryClass = categoryColors[task.category];
    const categoryEditButtonClass = categoryHoverColors[task.category];

    return (
        <></>
        // <TaskItemContent
        //     task={task}
        //     onEditTask={onEditTask}
        //     categoryClass={categoryClass}
        //     categoryEditButtonClass={categoryEditButtonClass}
        // />
    );
};
