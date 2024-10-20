import React, { useEffect, useRef, useState } from 'react';
import { BaseDialog } from './BaseDialog';
import { TaskForm, TaskFormData } from 'src/components/task/task_form/TaskForm';
import { Task } from '../../service/taskService';
import { useAllTaskLists } from 'src/components/context/TaskListsContext';

interface TaskDialogProps {
    open: boolean;
    listName: string;
    initialData?: Task | null;
    onSubmit: (taskData: TaskFormData) => void;
    onCancel: () => void;
    title: string;
}

export const TaskDialog: React.FC<TaskDialogProps> = ({
    open,
    listName,
    initialData,
    onSubmit,
    onCancel,
    title,
}) => {
    const formRef = useRef<HTMLFormElement | null>(null);
    const taskListsContext = useAllTaskLists();
    const availableTasks: Task[] = Object.values(taskListsContext).flatMap(
        provider => provider.taskList.tasks
    );

    const [visibleTitle, setVisibleTitle] = useState<string | null>(title);

    useEffect(() => {
        if (open) {
            setVisibleTitle(title);
        } else {
            const timer = setTimeout(() => {
                setVisibleTitle(null);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [title, open]);

    const handleSubmit = () => {
        if (formRef.current) {
            formRef.current.dispatchEvent(
                new Event('submit', { cancelable: true, bubbles: true })
            );
        }
    };

    return (
        <BaseDialog
            open={open}
            onCancel={onCancel}
            title={visibleTitle ?? ''}
            description="Task edit or create dialog"
            onSubmit={handleSubmit}
            submitOnCtrlEnter={true}
            contentClassName={'min-w-[800px]'}
        >
            <div className={'max-h-[600px] overflow-auto p-2'}>
                <TaskForm
                    ref={formRef}
                    listName={listName}
                    availableTasks={availableTasks}
                    initialData={initialData || undefined}
                    onSubmit={onSubmit}
                    onCancel={onCancel}
                />
            </div>
        </BaseDialog>
    );
};
