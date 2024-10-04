import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from 'src/components/ui/dialog';
import { Task } from '../../service/taskService';
import { TaskDetails } from './TaskItemContent';
import { categoryStyles } from 'src/components/task/categoryShades';

interface TaskDetailsDialogProps {
    open: boolean;
    task: Task | null;
    onClose: () => void;
}

export const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({
    open,
    task,
    onClose,
}) => {
    const [currentTask, setCurrentTask] = useState<Task | null>(null);

    useEffect(() => {
        if (open) {
            setCurrentTask(task);
        } else if (currentTask) {
            const timer = setTimeout(() => setCurrentTask(null), 500);
            return () => clearTimeout(timer);
        }
    }, [currentTask, open, task]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                onClose();
            }
        };

        if (open) {
            window.addEventListener('keydown', handleKeyDown, {
                capture: true,
            });
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown, {
                capture: true,
            });
        };
    }, [onClose, open]);

    if (!currentTask) {
        return null;
    }

    const { categoryBgColorClass } = categoryStyles[currentTask!.category];
    return (
        <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
            <DialogContent
                className={`min-w-[400px] ${categoryBgColorClass}`}
                aria-describedby="task-details-dialog"
            >
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold mb-4">
                        {currentTask!.title}
                    </DialogTitle>
                </DialogHeader>
                <TaskDetails task={currentTask!} />
            </DialogContent>
        </Dialog>
    );
};
