import { Task, TaskCategory } from "../../service/taskService";
import React from "react";
import { Button } from "src/components/ui/button";
import { CircleMinus, Edit } from "lucide-react";
import { useTaskProperties } from "src/components/context/TaskPropertiesContext";

interface TaskItemContentProps {
    task: Task;
    showMetadata?: boolean;
}

export const categoryColors: Record<TaskCategory, string> = {
    [TaskCategory.GREEN]: "bg-green-100 dark:bg-green-800",
    [TaskCategory.BLUE]: "bg-blue-100 dark:bg-blue-800",
    [TaskCategory.RED]: "bg-red-100 dark:bg-red-800",
    [TaskCategory.YELLOW]: "bg-yellow-100 dark:bg-yellow-700",
    [TaskCategory.WHITE]: "bg-gray-100 dark:bg-gray-500",
    [TaskCategory.PINK]: "bg-pink-100 dark:bg-pink-800",
};

export const categoryHoverColors: Record<TaskCategory, string> = {
    [TaskCategory.GREEN]: "hover:bg-green-200 dark:hover:bg-green-900",
    [TaskCategory.BLUE]: "hover:bg-blue-200 dark:hover:bg-blue-900",
    [TaskCategory.RED]: "hover:bg-red-200 dark:hover:bg-red-900",
    [TaskCategory.YELLOW]: "hover:bg-yellow-200 dark:hover:bg-yellow-800",
    [TaskCategory.WHITE]: "hover:bg-gray-200 dark:hover:bg-gray-600",
    [TaskCategory.PINK]: "hover:bg-pink-200 dark:hover:bg-pink-900",
}

export const TaskMetadata: React.FC<{ task: Task }> = ({ task }) => (
    <div className="text-xs mt-1 text-gray-600 dark:text-gray-300">
        <p className="text-sm">{task.description}</p>
        <span className="mr-2">Category: {task.category}</span>
        <span className="mr-2">Size: {task.size}</span>
        {task.startTime && <span>Start: {task.startTime}</span>}
    </div>
);

export const TaskItemContent: React.FC<TaskItemContentProps> = ({
                                                                    task,
                                                                    showMetadata = true,
                                                                }) => {
    const categoryClass = categoryColors[task.category];
    const categoryEditButtonClass = categoryHoverColors[task.category];

    const { onTaskEdit, onTaskRemove } = useTaskProperties()

    return (
        <div className={`p-4 mb-2 rounded shadow-md text-gray-800 dark:text-gray-100 ${categoryClass}`}>
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-semibold">{task.title}</h4>
                    {showMetadata && <TaskMetadata task={task} />}
                </div>
                <div className="flex items-end">
                    <Button variant="ghost" size="sm" onClick={() => onTaskEdit(task)} className={categoryEditButtonClass}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onTaskRemove(task)} className={categoryEditButtonClass}>
                        <CircleMinus className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
