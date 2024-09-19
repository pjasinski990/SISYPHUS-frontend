import { Task, TaskCategory, TaskSize } from "../../service/taskService";
import React from "react";
import { Button } from "src/components/ui/button";
import { CircleMinus, Edit } from "lucide-react";
import { useTaskProperties } from "src/components/context/TaskPropertiesContext";
import { CSSTransition } from "react-transition-group";
import { Square } from 'lucide-react'; // Import square icons
import "./TaskItemContent.css";

interface TaskItemContentProps {
    task: Task;
    showMetadata?: boolean;
}

export const categoryColorClasses: Record<TaskCategory, string> = {
    [TaskCategory.GREEN]: "bg-green-100 dark:bg-green-800",
    [TaskCategory.BLUE]: "bg-blue-100 dark:bg-blue-800",
    [TaskCategory.RED]: "bg-red-100 dark:bg-red-800",
    [TaskCategory.YELLOW]: "bg-yellow-100 dark:bg-yellow-700",
    [TaskCategory.WHITE]: "bg-gray-100 dark:bg-gray-500",
    [TaskCategory.PINK]: "bg-pink-100 dark:bg-pink-800",
};

export const categoryHoverColorClasses: Record<TaskCategory, string> = {
    [TaskCategory.GREEN]: "hover:bg-green-200 dark:hover:bg-green-900",
    [TaskCategory.BLUE]: "hover:bg-blue-200 dark:hover:bg-blue-900",
    [TaskCategory.RED]: "hover:bg-red-200 dark:hover:bg-red-900",
    [TaskCategory.YELLOW]: "hover:bg-yellow-200 dark:hover:bg-yellow-800",
    [TaskCategory.WHITE]: "hover:bg-gray-200 dark:hover:bg-gray-600",
    [TaskCategory.PINK]: "hover:bg-pink-200 dark:hover:bg-pink-900",
};

export const categoryBorderColorClasses: Record<TaskCategory, string> = {
    [TaskCategory.GREEN]: "hover:border-4 hover:border-green-200 dark:hover:border-green-600",
    [TaskCategory.BLUE]: "hover:border-4 hover:border-blue-200 dark:hover:border-blue-600",
    [TaskCategory.RED]: "hover:border-4 hover:border-red-200 dark:hover:border-red-600",
    [TaskCategory.YELLOW]: "hover:border-4 hover:border-yellow-200 dark:hover:border-yellow-600",
    [TaskCategory.WHITE]: "hover:border-4 hover:border-gray-200 dark:hover:border-gray-400",
    [TaskCategory.PINK]: "hover:border-4 hover:border-pink-200 dark:hover:border-pink-600",
};

export const TaskMetadata: React.FC<{ task: Task }> = ({ task }) => (
    <div className="text-xs mt-1 text-gray-600 dark:text-gray-300">
        <p className="text-sm pb-2">{task.description}</p>
        <span className="mr-2">Category: {task.category}</span>
        <span className="mr-2">Size: {task.size}</span>
        {task.startTime && <span>Start: {task.startTime}</span>}
    </div>
);

export const TaskItemContent: React.FC<TaskItemContentProps> = ({
                                                                    task,
                                                                    showMetadata = true,
                                                                }) => {
    const categoryClass = categoryColorClasses[task.category];
    const categoryHoverClass = categoryHoverColorClasses[task.category];
    const borderHoverClass = categoryBorderColorClasses[task.category]
    const defaultBorderClass = "border-4 border-transparent";

    const { onTaskEdit, onTaskRemove } = useTaskProperties();
    const iconSize = task.size === TaskSize.SMALL ? 8 : 16; // Sizes in pixels

    return (
        <div
            className={`flex-grow w-full p-4 mb-2 rounded shadow-md text-gray-800 dark:text-gray-100 ${categoryClass} ${defaultBorderClass} ${borderHoverClass} cursor-pointer transition-all duration-200`}
        >
            <div className="flex justify-between items-start">
                <div className="flex-1 overflow-hidden">
                    <Square
                        size={iconSize}
                        className="float-left mr-2"
                        style={{marginTop: task.size === TaskSize.SMALL ? '6px' : '2px'}}
                        fill={`${task.category}`} stroke={`${task.category}`}
                    />
                    <h4 className="font-semibold">{task.title}</h4>
                </div>
                <div className="flex items-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onTaskEdit(task);
                        }}
                        className={categoryHoverClass}
                    >
                        <Edit className="h-4 w-4"/>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onTaskRemove(task);
                        }}
                        className={categoryHoverClass}
                    >
                        <CircleMinus className="h-4 w-4"/>
                    </Button>
                </div>
            </div>
            <CSSTransition
                in={showMetadata}
                timeout={300}
                classNames="metadata"
                unmountOnExit
            >
                <TaskMetadata task={task}/>
            </CSSTransition>
        </div>
    );
};
