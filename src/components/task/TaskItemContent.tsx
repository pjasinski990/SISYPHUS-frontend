import React, { useEffect, useState } from 'react';
import { Task, TaskSize } from '../../service/taskService';
import { Button } from 'src/components/ui/button';
import { Edit, Square, Trash } from 'lucide-react';
import { CSSTransition } from 'react-transition-group';
import './TaskItemContent.css';
import { categoryStyles } from 'src/components/task/categoryShades';
import { useTaskExtensions } from 'src/components/context/TaskExtensionContext';
import { useTaskInteraction } from 'src/components/context/TaskInteractionContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TaskDetailsDialog } from './TaskDetailsDialog';
import { ContextMenu } from 'src/components/task/TaskContextMenu';

interface TaskItemContentProps {
    task: Task;
    showDetails?: boolean;
}

export const TaskDetails: React.FC<{ task: Task }> = ({ task }) => (
    <>
        <TaskDescription task={task} />
        <div className="text-xs mt-1 dark:text-gray-100">
            <div className="p-2 flex flex-col items-end">
                {task.startTime && <span>Start: {task.startTime}</span>}
                <span>Category: {task.category}</span>
                <span className="pb-2">Size: {task.size}</span>
                <span>Created: {task.createdAt}</span>
                <span>Updated: {task.updatedAt}</span>
                <span>Finished: {task.finishedAt}</span>
            </div>
        </div>
    </>
);

const TaskDescription: React.FC<{ task: Task }> = ({ task }) => {
    const { categoryMarkerColorClass } = categoryStyles[task.category];

    return (
        <div
            className={`${categoryMarkerColorClass} prose dark:prose-invert px-2`}
        >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {task.description}
            </ReactMarkdown>
        </div>
    );
};

export const TaskItemContent: React.FC<TaskItemContentProps> = ({
    task,
    showDetails = true,
}) => {
    const {
        categoryBgColorClass,
        categoryBgHoverColorClass,
        categoryBorderColorClass,
        iconClass,
    } = categoryStyles[task.category];

    const defaultBorderClass = 'border-4 border-transparent';
    const { openEditTaskDialog, openRemoveTaskDialog } = useTaskInteraction();
    const iconSize = task.size === TaskSize.SMALL ? 10 : 20;

    const { extraButtons } = useTaskExtensions();

    const [showContextMenu, setShowContextMenu] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState<{
        x: number;
        y: number;
    }>({ x: 0, y: 0 });
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        const menuWidth = 150;
        const menuHeight = 40;

        let x = e.clientX;
        let y = e.clientY;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (x + menuWidth > viewportWidth) {
            x = viewportWidth - menuWidth - 10;
        }

        if (y + menuHeight > viewportHeight) {
            y = viewportHeight - menuHeight - 10;
        }

        setContextMenuPosition({ x, y });
        setShowContextMenu(true);
    };

    useEffect(() => {
        const handleClickOutside = () => {
            if (showContextMenu) {
                setShowContextMenu(false);
            }
        };

        const handleScroll = () => {
            if (showContextMenu) {
                setShowContextMenu(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        window.addEventListener('scroll', handleScroll);

        return () => {
            document.removeEventListener('click', handleClickOutside);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [showContextMenu]);

    return (
        <>
            <TaskDetailsDialog
                task={task}
                open={showDetailsDialog}
                onClose={() => setShowDetailsDialog(false)}
            />
            <div
                onContextMenu={handleContextMenu}
                className={`task-item-content relative flex-grow w-full p-0.5 rounded shadow-md text-gray-950 dark:text-gray-100 ${categoryBgColorClass} ${defaultBorderClass} ${categoryBorderColorClass} cursor-pointer transition-all duration-75`}
            >
                <div className="flex justify-between items-start">
                    <div className="flex-1 flex pt-2">
                        <Square
                            size={iconSize}
                            style={{
                                marginTop:
                                    task.size === TaskSize.BIG
                                        ? undefined
                                        : '8px',
                                marginLeft:
                                    task.size === TaskSize.BIG ? '2px' : '7px',
                                marginRight:
                                    task.size === TaskSize.BIG ? '4px' : '7px',
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
                            onClick={e => {
                                e.stopPropagation();
                                openEditTaskDialog(task);
                            }}
                            className={`${categoryBgHoverColorClass} task-item-button`}
                            aria-label="Edit Task"
                            title="Edit Task"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={e => {
                                e.stopPropagation();
                                openRemoveTaskDialog(task);
                            }}
                            className={`${categoryBgHoverColorClass} task-item-button`}
                            aria-label="Remove Task"
                            title="Remove Task"
                        >
                            <Trash className="h-4 w-4" />
                        </Button>
                        {extraButtons.map((buttonConfig, index) => {
                            const IconComponent = buttonConfig.icon;
                            return (
                                <Button
                                    key={index}
                                    variant="ghost"
                                    size="sm"
                                    onClick={e => {
                                        e.stopPropagation();
                                        buttonConfig.handler(task);
                                    }}
                                    className={`${categoryBgHoverColorClass} task-item-button`}
                                    aria-label={`Extension Button ${index + 1}`}
                                    title={`Extension Button ${index + 1}`}
                                >
                                    <IconComponent className="h-4 w-4" />
                                </Button>
                            );
                        })}
                    </div>
                </div>
                <CSSTransition
                    in={showDetails}
                    timeout={300}
                    classNames="task-details"
                    unmountOnExit
                >
                    <>
                        <TaskDescription task={task} />
                        <div className="text-sm p-2 flex flex-col items-end">
                            {task.startTime && (
                                <span>Start: {task.startTime}</span>
                            )}
                        </div>
                    </>
                </CSSTransition>
                <ContextMenu
                    show={showContextMenu}
                    position={contextMenuPosition}
                    onClose={() => setShowContextMenu(false)}
                    onShowDetails={() => setShowDetailsDialog(true)}
                />
            </div>
        </>
    );
};
