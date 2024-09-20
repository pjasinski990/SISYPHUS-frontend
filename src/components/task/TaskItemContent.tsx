import { Task, TaskSize } from "../../service/taskService";
import React from "react";
import { Button } from "src/components/ui/button";
import { CircleMinus, Edit } from "lucide-react";
import { useTaskProperties } from "src/components/context/TaskPropertiesContext";
import { CSSTransition } from "react-transition-group";
import { Square } from 'lucide-react';
import "./TaskItemContent.css";
import { categoryStyles } from "src/components/task/categoryShades";

interface TaskItemContentProps {
    task: Task;
    showMetadata?: boolean;
}

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
    const {
        categoryColorClass,
        categoryHoverColorClass,
        categoryBorderColorClass,
        iconClass,
    } = categoryStyles[task.category];

    const defaultBorderClass = "border-4 border-transparent";
    const { onTaskEdit, onTaskRemove } = useTaskProperties();
    const iconSize = task.size === TaskSize.SMALL ? 8 : 16;

    return (
        <div
            className={`flex-grow w-full p-4 mb-2 rounded shadow-md text-gray-800 dark:text-gray-100 ${categoryColorClass} ${defaultBorderClass} ${categoryBorderColorClass} cursor-pointer transition-all duration-200`}
        >
            <div className="flex justify-between items-start">
                <div className="flex-1 overflow-hidden">
                    <Square
                        size={iconSize}
                        style={{
                            marginTop: task.size === TaskSize.BIG ? '3px' : '8px',
                            marginLeft: task.size === TaskSize.BIG ? '0px' : '3px',
                        }}
                        className={`float-left mr-2 ${iconClass}`}
                        fill="currentColor"
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
                        className={categoryHoverColorClass}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onTaskRemove(task);
                        }}
                        className={categoryHoverColorClass}
                    >
                        <CircleMinus className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <CSSTransition
                in={showMetadata}
                timeout={300}
                classNames="metadata"
                unmountOnExit
            >
                <TaskMetadata task={task} />
            </CSSTransition>
        </div>
    );
};
