import React, { useEffect, useState } from 'react';
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
    const [visibleTask, setVisibleTask] = useState<Task | null>(task);

    useEffect(() => {
        if (open) {
            setVisibleTask(task);
        } else {
            const timer = setTimeout(() => {
                setVisibleTask(null);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [open, task]);

    const categoryBgColorClass = visibleTask
        ? categoryStyles[visibleTask.category].categoryBgColorClass
        : '';

    return (
        <BaseDialog
            open={open}
            onCancel={onClose}
            title={visibleTask ? visibleTask.title : 'Task Details'}
            description="Task details dialog"
            contentClassName={`min-w-[400px] ${categoryBgColorClass}`}
            closeAnimationDuration={500}
        >
            {visibleTask ? (
                <TaskDetails task={visibleTask} />
            ) : (
                <div className="p-4">No task selected.</div>
            )}
        </BaseDialog>
    );
};
