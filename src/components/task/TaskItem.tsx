import { Task } from "../../service/taskService";
import React from "react";
import { categoryColors, categoryHoverColors, TaskItemContent } from "src/components/task/TaskItemContent";

interface TaskItemProps {
    task: Task;
    onEditTask: (task: Task) => void;
    onRemoveTask: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onEditTask, onRemoveTask }) => {
    const categoryClass = categoryColors[task.category];
    const categoryEditButtonClass = categoryHoverColors[task.category];

    return (
        <TaskItemContent
            task={task}
            onEditTask={onEditTask}
            onRemoveTask={onRemoveTask}
            categoryClass={categoryClass}
            categoryEditButtonClass={categoryEditButtonClass}
        />
    );
};
