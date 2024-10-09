import React, { useEffect, useRef, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from 'src/components/ui/dialog';
import { TaskForm, TaskFormData } from 'src/components/task/TaskForm';
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
    const [currentTitle, setCurrentTitle] = useState<string | null>(null);
    const taskListsContext = useAllTaskLists();
    const availableTasks: Task[] = Object.values(taskListsContext).flatMap(
        provider => provider.taskList.tasks
    );

    useEffect(() => {
        if (open) {
            setCurrentTitle(title);
        } else if (currentTitle) {
            const timer = setTimeout(() => {
                setCurrentTitle(null);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [currentTitle, open, title]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === 'Enter' && open) {
                event.preventDefault();
                event.stopPropagation();
                if (formRef.current) {
                    formRef.current.dispatchEvent(
                        new Event('submit', { cancelable: true, bubbles: true })
                    );
                }
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
    }, [open, onCancel]);

    if (!currentTitle) {
        return null;
    }
    return (
        <Dialog open={open} onOpenChange={isOpen => !isOpen && onCancel()}>
            <DialogContent
                className={'min-w-[800px]'}
                aria-describedby={'task dialog'}
            >
                <DialogHeader>
                    <DialogTitle>{currentTitle}</DialogTitle>
                </DialogHeader>
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
            </DialogContent>
        </Dialog>
    );
};
