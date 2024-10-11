import React, { useEffect, useMemo } from 'react';
import { Task } from '../../service/taskService';
import { TaskItem } from 'src/components/task/TaskItem';
import { useTaskNavigation } from 'src/components/context/TaskNavigationContext';
import { TaskList } from '../../lib/taskList';
import { Shortcut } from '../context/ShortcutsContext';
import { useRegisterShortcut } from '../hooks/useRegisterShortcut';

interface ScratchTaskListProps {
    taskList: TaskList;
    placeholderNode: string | React.ReactNode;
}

export const ScratchTaskList: React.FC<ScratchTaskListProps> = ({
    taskList,
    placeholderNode,
}) => {
    const { registerList, unregisterList, highlightedTaskId } =
        useTaskNavigation();

    useEffect(() => {
        registerList(taskList.name, false);
        return () => unregisterList(taskList.name);
    }, [taskList.name, registerList, unregisterList]);

    const { moveHighlight, clearHighlight, performAction } =
        useTaskNavigation();

    const moveDownShortcut: Shortcut = useMemo(
        () => ({
            id: 'move-highlight-down',
            keys: ['j'],
            action: () => moveHighlight('down'),
            description: 'Move highlight down',
            order: 3,
        }),
        [moveHighlight]
    );

    const moveUpShortcut: Shortcut = useMemo(
        () => ({
            id: 'move-highlight-up',
            keys: ['k'],
            action: () => moveHighlight('up'),
            description: 'Move highlight up',
            order: 3,
        }),
        [moveHighlight]
    );

    const clearHighlightShortcut: Shortcut = useMemo(
        () => ({
            id: 'clear-highlight',
            keys: ['Escape'],
            action: () => {
                clearHighlight();
            },
            description: 'Clear highlight',
            order: 4,
        }),
        [clearHighlight]
    );

    const editTaskShortcut: Shortcut = useMemo(
        () => ({
            id: 'edit-highlighted-task',
            keys: ['e'],
            action: () => performAction('edit'),
            description: 'Edit highlighted task',
            order: 3,
        }),
        [performAction]
    );

    const deleteTaskShortcut: Shortcut = useMemo(
        () => ({
            id: 'delete-highlighted-task',
            keys: ['x'],
            action: () => performAction('delete'),
            description: 'Delete highlighted task',
            order: 3,
        }),
        [performAction]
    );

    useRegisterShortcut(moveDownShortcut);
    useRegisterShortcut(moveUpShortcut);
    useRegisterShortcut(clearHighlightShortcut);
    useRegisterShortcut(editTaskShortcut);
    useRegisterShortcut(deleteTaskShortcut);

    return (
        <Tasks
            tasks={taskList.tasks}
            placeholderNode={placeholderNode}
            highlightedTaskId={highlightedTaskId}
        />
    );
};

const Tasks: React.FC<{
    tasks: Task[];
    highlightedTaskId: string | null;
    placeholderNode: string | React.ReactNode;
}> = ({ tasks, highlightedTaskId, placeholderNode }) => {
    return (
        <div className="flex flex-col gap-2 min-h-[100px] max-h-[400px]">
            {tasks.map(task => (
                <TaskItem
                    key={task.id}
                    task={task}
                    isHighlighted={highlightedTaskId === task.id}
                />
            ))}
            {tasks.length === 0 && (
                <div className="h-[120px] flex flex-col space-y-2 items-center justify-center text-center font-mono text-slate-300 dark:text-slate-700">
                    {placeholderNode}
                </div>
            )}
        </div>
    );
};
