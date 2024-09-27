import { Task, TaskSize } from "../../service/taskService";
import React from "react";
import { Button } from "src/components/ui/button";
import { Edit, Square, Trash } from "lucide-react";
import { CSSTransition } from "react-transition-group";
import "./TaskItemContent.css";
import { categoryStyles } from "src/components/task/categoryShades";
import { useTaskExtensions } from "src/components/context/TaskExtensionContext";
import { useTaskInteraction } from "src/components/context/TaskInteractionContext";
import ReactMarkdown from "react-markdown";

interface TaskItemContentProps {
    task: Task;
    showMetadata?: boolean;
}

export const TaskDetails: React.FC<{ task: Task }> = ({ task }) => (
    <div className={`text-xs mt-1 dark:text-gray-100`}>
        <div className={'p-2 flex flex-col items-end'}>
            {task.startTime && <span>Start: {task.startTime}</span>}
            <span>Category: {task.category}</span>
            <span className={'pb-2'}>Size: {task.size}</span>
            <span>Created: {task.createdAt}</span>
            <span>Updated: {task.updatedAt}</span>
            <span>Finished: {task.finishedAt}</span>
        </div>
    </div>
);

export const TaskItemContent: React.FC<TaskItemContentProps> = ({
                                                                    task,
                                                                    showMetadata = true,
                                                                }) => {
    const {
        categoryMarkerColorClass,
        categoryBgColorClass,
        categoryBgHoverColorClass,
        categoryBorderColorClass,
        iconClass,
    } = categoryStyles[task.category];

    console.log(categoryMarkerColorClass)
    const defaultBorderClass = "border-4 border-transparent";
    const { openEditTaskDialog, openRemoveTaskDialog } = useTaskInteraction()
    const iconSize = task.size === TaskSize.SMALL ? 10 : 20;

    const { extraButtons } = useTaskExtensions();

    return (
        <div
            className={`task-item-content flex-grow w-full p-0.5 rounded shadow-md text-gray-950 dark:text-gray-100 ${categoryBgColorClass} ${defaultBorderClass} ${categoryBorderColorClass} cursor-pointer transition-all duration-75`}
        >
            <div className="flex justify-between items-start">
                <div className="flex-1 flex pt-2">
                    <Square
                        size={iconSize}
                        style={{
                            marginTop: task.size === TaskSize.BIG ? '' : '8px',
                            marginLeft: task.size === TaskSize.BIG ? '2px' : '7px',
                            marginRight: task.size === TaskSize.BIG ? '4px' : '7px',
                        }}
                        className={`mr-2 inline flex-shrink-0 self-start ${iconClass}`}
                        fill="currentColor"
                    />
                    <h4 className="font-semibold leading-snug">
                        {task.title}
                    </h4>
                </div>
                <div className="flex items-start space-x-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            openEditTaskDialog(task);
                        }}
                        className={`${categoryBgHoverColorClass} task-item-button`}
                        aria-label="Edit Task"
                        title="Edit Task"
                    >
                        <Edit className="h-4 w-4"/>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            openRemoveTaskDialog(task);
                        }}
                        className={`${categoryBgHoverColorClass} task-item-button`}
                        aria-label="Remove Task"
                        title="Remove Task"
                    >
                        <Trash className="h-4 w-4"/>
                    </Button>
                    {extraButtons.map((buttonConfig, index) => {
                        const IconComponent = buttonConfig.icon;
                        return (
                            <Button
                                key={index}
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    buttonConfig.handler(task);
                                }}
                                className={`${categoryBgHoverColorClass} taskItemButton`}
                                aria-label={`Extension Button ${index + 1}`}
                                title={`Extension Button ${index + 1}`}
                            >
                                <IconComponent className="h-4 w-4"/>
                            </Button>
                        );
                    })}
                </div>
            </div>
            <div className={`${categoryMarkerColorClass} prose dark:prose-invert px-2`}>
                <ReactMarkdown>
                    {task.description}
                </ReactMarkdown>
            </div>
            <CSSTransition
                in={showMetadata}
                timeout={300}
                classNames="metadata"
                unmountOnExit
            >
                <TaskDetails task={task}/>
            </CSSTransition>
        </div>
    );
};
