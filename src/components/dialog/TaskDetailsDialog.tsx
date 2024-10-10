import React from 'react';
import { BaseDialog } from './BaseDialog';
import { Task } from '../../service/taskService';
import { categoryStyles } from 'src/components/task/categoryShades';
import { TaskDetails } from '../task/TaskItemContent';

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
    if (!task) {
        return null;
    }

    const { categoryBgColorClass } = categoryStyles[task.category];

    return (
        <BaseDialog
            open={open}
            onCancel={onClose}
            title={task.title}
            description="Task details dialog"
            contentClassName={`min-w-[400px] ${categoryBgColorClass}`}
            closeAnimationDuration={500}
        >
            <TaskDetails task={task} />
        </BaseDialog>
    );
};
