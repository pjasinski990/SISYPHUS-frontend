import { Task } from "../../service/taskService";
import React from "react";
import { TaskItemContent } from "src/components/task/TaskItemContent";
import { TaskPropertiesProvider } from "src/components/context/TaskPropertiesContext";

interface TaskItemProps {
    task: Task;
    isVanity?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, isVanity = false }) => {
    if (isVanity) {
        return (
            <TaskPropertiesProvider
                onTaskEdit={() => {}}
                onTaskRemove={() => {}}
                isDraggable={false}
                isFoldable={false}
            >
                <TaskItemContent task={task} />
            </TaskPropertiesProvider>
        );
    } else {
        return (
            <TaskItemContent task={task} />
        )
    }
};
