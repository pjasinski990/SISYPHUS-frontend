import React from 'react';
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
    task: Task;
    onClose: () => void;
}

export const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({
    open,
    task,
    onClose,
}) => {
    if (!open) return null;

    const { categoryBgColorClass } = categoryStyles[task.category];
    return (
        <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
            <DialogContent
                className={`min-w-[400px] ${categoryBgColorClass}`}
                aria-describedby="task-details-dialog"
            >
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold mb-4">
                        {task.title}
                    </DialogTitle>
                </DialogHeader>
                <TaskDetails task={task} />
            </DialogContent>
        </Dialog>
    );
};
