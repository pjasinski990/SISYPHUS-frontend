import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Task, TaskSize } from '../../service/taskService';
import { Button } from 'src/components/ui/button';
import { Badge } from 'src/components/ui/badge';
import { Edit, Square, Trash } from 'lucide-react';
import { CSSTransition } from 'react-transition-group';
import './TaskItemContent.css';
import { categoryStyles } from 'src/components/task/categoryShades';
import { useTaskExtensions } from 'src/components/context/TaskExtensionContext';
import { ContextMenu } from 'src/components/task/TaskContextMenu';
import MarkdownRenderer from 'src/components/markdown/MarkdownRenderer';
import { useTaskAction } from 'src/components/context/TaskActionContext';
import { prettyDurationFromIsoTime } from 'src/lib/utils';

interface TaskItemContentProps {
    task: Task;
    isVanity?: boolean;
    showDetails?: boolean;
    isHighlighted?: boolean;
}

export const TaskDetails: React.FC<{ task: Task }> = ({ task }) => {
    return (
        <>
            <TaskDescription task={task} />
            <div className="text-xs mt-1 dark:text-gray-100">
                <div className="p-2 flex flex-col items-end">
                    {task.startTime && <span>Start: {task.startTime}</span>}
                    {task.duration && (
                        <span>
                            Duration: {prettyDurationFromIsoTime(task.duration)}
                        </span>
                    )}
                    <span>Category: {task.category}</span>
                    <span className="pb-2">Size: {task.size}</span>
                    <span>ID: {task.id}</span>
                    <span>Created: {task.createdAt}</span>
                    <span>Updated: {task.updatedAt}</span>
                    <span>Finished: {task.finishedAt}</span>
                </div>
            </div>
        </>
    );
};

const TaskDescription: React.FC<{ task: Task }> = ({ task }) => {
    const { categoryMarkerColorClass } = categoryStyles[task.category];

    return (
        <div className={`${categoryMarkerColorClass} break-words`}>
            <MarkdownRenderer content={task.description ?? ''} />
        </div>
    );
};

export const TaskItemContent: React.FC<TaskItemContentProps> = ({
    task,
    isVanity = false,
    showDetails = true,
    isHighlighted = false,
}) => {
    const {
        categoryBgColorClass,
        categoryBgHoverColorClass,
        categoryButtonHoverColorClass,
        categoryHighlightClass,
        iconClass,
    } = categoryStyles[task.category];

    const {
        openEditTaskDialog,
        openTaskDetailsDialog,
        openRemoveTaskDialog,
        openUnravelTaskDialog,
    } = useTaskAction();

    const defaultBorderClass = 'border-4 border-transparent';
    const iconSize = task.size === TaskSize.SMALL ? 10 : 20;
    const { extraButtons } = useTaskExtensions();
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState<{
        x: number;
        y: number;
    }>({
        x: 0,
        y: 0,
    });
    const transitionNodeRef = useRef(null);

    const handleEditTask = useCallback(
        (task: Task) => {
            if (isVanity) return;
            openEditTaskDialog(task);
        },
        [isVanity, openEditTaskDialog]
    );

    const handleRemoveTask = useCallback(
        (task: Task) => {
            if (isVanity) return;
            openRemoveTaskDialog(task);
        },
        [isVanity, openRemoveTaskDialog]
    );

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

    const highlightedClass = isHighlighted
        ? categoryHighlightClass
        : defaultBorderClass;
    return (
        <div>
            <div
                onContextMenu={handleContextMenu}
                className={`task-item-content relative flex-grow w-full p-0.5 rounded shadow-md text-gray-950 dark:text-gray-100 ${categoryBgColorClass} ${highlightedClass} ${categoryBgHoverColorClass} cursor-pointer transition-all duration-75`}
            >
                <div className={'mx-0.5 mt-0.5 flex space-x-1'}>
                    {task.tags?.map(tag => {
                        const badgeClasses = 'm-0 px-2';
                        const projectBgClasses =
                            'bg-violet-500 dark:bg-violet-600 dark:text-white';

                        const isProjectTag = tag.startsWith('p:');
                        const displayTag = isProjectTag
                            ? tag.substring(2)
                            : tag;
                        const classes = `${badgeClasses} ${isProjectTag ? projectBgClasses : ''}`;

                        return (
                            <Badge
                                key={tag}
                                className={classes}
                                style={{ fontSize: '0.65rem' }}
                            >
                                {displayTag}
                            </Badge>
                        );
                    })}
                </div>
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
                        <h4 className="font-semibold leading-snug break-words">
                            {task.title}
                        </h4>
                    </div>
                    <div className="flex items-start space-x-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={e => {
                                e.stopPropagation();
                                handleEditTask(task);
                            }}
                            className={`${categoryButtonHoverColorClass} task-item-button`}
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
                                handleRemoveTask(task);
                            }}
                            className={`${categoryButtonHoverColorClass} task-item-button`}
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
                    nodeRef={transitionNodeRef}
                    in={showDetails}
                    timeout={300}
                    classNames="task-details"
                    unmountOnExit
                >
                    <div ref={transitionNodeRef}>
                        <TaskDescription task={task} />
                        <div className="text-sm p-2 flex flex-col items-end">
                            {task.startTime && (
                                <span>Start: {task.startTime}</span>
                            )}
                            {task.duration && (
                                <span>
                                    Duration:{' '}
                                    {prettyDurationFromIsoTime(task.duration)}
                                </span>
                            )}
                        </div>
                    </div>
                </CSSTransition>
                <ContextMenu
                    show={!isVanity && showContextMenu}
                    position={contextMenuPosition}
                    onClose={() => setShowContextMenu(false)}
                    onShowDetails={() => openTaskDetailsDialog(task)}
                    onEdit={() => handleEditTask(task)}
                    onRemove={() => handleRemoveTask(task)}
                    onUnravel={() => openUnravelTaskDialog(task)}
                />
            </div>
        </div>
    );
};
