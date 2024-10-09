import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from 'src/components/ui/dialog';
import { Task } from '../../service/taskService';
import { generativeService } from '../../service/generativeService';
import { TaskPropertiesProvider } from 'src/components/context/TaskPropertiesContext';
import { TaskItem } from 'src/components/task/TaskItem';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { TaskLoadingPlaceholder } from 'src/components/library/LoadingPlaceholder';
import { TaskActionProvider } from 'src/components/context/TaskActionContext';
import { TaskFormData } from 'src/components/task/TaskForm';

interface UnravelDialogProps {
    open: boolean;
    unraveledTask: Task | null;
    onSubmit: (selectedTasks: Task[]) => void;
    onCancel: () => void;
}

export const UnravelDialog: React.FC<UnravelDialogProps> = ({
    open,
    unraveledTask,
    onSubmit,
    onCancel,
}) => {
    const formRef = useRef<HTMLFormElement | null>(null);
    const [currentTask, setCurrentTask] = useState<Task | null>(null);
    const [proposedTasks, setProposedTasks] = useState<Task[]>([]);
    const [nTasks, setNTasks] = useState<number>(3);
    const [additionalContext, setAdditionalContext] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (open) {
            setCurrentTask(unraveledTask);
            setProposedTasks([]);
            setNTasks(3);
            setAdditionalContext('');
        } else if (currentTask) {
            const timer = setTimeout(() => {
                setCurrentTask(null);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [currentTask, open, unraveledTask]);

    const handleSubmitProposedTasks = useCallback(() => {
        if (formRef.current) {
            onSubmit(proposedTasks);
        }
    }, [onSubmit, proposedTasks]);

    const refreshPropositions = useCallback(() => {
        if (!open || !currentTask) {
            return;
        }
        setProposedTasks([]);
        setIsLoading(true);

        generativeService
            .unravel({ taskId: currentTask.id!, nTasks, additionalContext })
            .then(res => setProposedTasks(res))
            .catch(error => {
                console.error('Error fetching proposed tasks:', error);
            })
            .finally(() => setIsLoading(false));
    }, [open, currentTask, nTasks, additionalContext]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Enter' && open) {
                event.preventDefault();
                event.stopPropagation();
                if (event.ctrlKey) {
                    handleSubmitProposedTasks();
                } else {
                    refreshPropositions();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleSubmitProposedTasks, open, refreshPropositions]);

    const handleTaskFormSubmit = useCallback(
        (taskData: TaskFormData, editingTask: Task | null) => {
            if (editingTask) {
                setProposedTasks(prevTasks =>
                    prevTasks.map(task =>
                        task.id === editingTask.id
                            ? { ...task, ...taskData }
                            : task
                    )
                );
            }
        },
        []
    );

    const handleConfirmRemoveTask = useCallback((task: Task) => {
        setProposedTasks(prevTasks => prevTasks.filter(t => t.id !== task.id));
    }, []);

    if (!currentTask) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={isOpen => !isOpen && onCancel()}>
            <DialogContent
                className={'min-w-[600px]'}
                aria-describedby={'task dialog'}
            >
                <DialogHeader>
                    <DialogTitle>Unravel Task: {currentTask.title}</DialogTitle>
                </DialogHeader>
                <form ref={formRef} onSubmit={handleSubmitProposedTasks}>
                    <div className="flex flex-col">
                        <label
                            htmlFor="nTasks"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Number of tasks to generate
                        </label>
                        <Input
                            id="nTasks"
                            type="number"
                            min={1}
                            max={12}
                            value={nTasks}
                            onChange={e => setNTasks(Number(e.target.value))}
                            required
                            className={'mb-2'}
                        />
                        <label
                            htmlFor="additionalContext"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Context
                        </label>
                        <Input
                            id="additionalContext"
                            type="text"
                            value={additionalContext}
                            onChange={e => setAdditionalContext(e.target.value)}
                            placeholder="Additional context for the task"
                            className={'mb-6'}
                        />
                        <Button
                            type="button"
                            onClick={refreshPropositions}
                            disabled={isLoading}
                            className={'mx-0.5'}
                        >
                            {isLoading
                                ? 'Loading...'
                                : 'Regenerate propositions'}
                        </Button>
                    </div>
                </form>
                <div
                    className={
                        'max-h-[600px] overflow-auto px-8 py-2 flex flex-col space-y-2'
                    }
                >
                    <TaskActionProvider
                        onTaskFormSubmit={handleTaskFormSubmit}
                        onConfirmRemoveTask={handleConfirmRemoveTask}
                    >
                        <TaskPropertiesProvider
                            isDraggable={false}
                            isFoldable={false}
                        >
                            {isLoading ? (
                                <div className="flex justify-center items-center h-full">
                                    <TaskLoadingPlaceholder nTasks={nTasks} />
                                </div>
                            ) : proposedTasks.length > 0 ? (
                                proposedTasks.map(proposedTask => (
                                    <div
                                        key={proposedTask.id}
                                        className="relative"
                                    >
                                        <TaskItem task={proposedTask} />
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">
                                    No tasks generated.
                                </p>
                            )}
                        </TaskPropertiesProvider>
                    </TaskActionProvider>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button
                        type="button"
                        onClick={onCancel}
                        variant="secondary"
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={proposedTasks.length === 0 || isLoading}
                        onClick={handleSubmitProposedTasks}
                    >
                        Submit
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
