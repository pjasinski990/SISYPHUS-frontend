import React, { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "src/components/ui/dialog";
import { TaskForm, TaskFormData } from "src/components/task/TaskForm";
import { Task } from "../../service/taskService";

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

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Enter' && open) {
                event.preventDefault();
                if (formRef.current) {
                    formRef.current.dispatchEvent(
                        new Event('submit', { cancelable: true, bubbles: true })
                    );
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
            <DialogContent aria-describedby={"task dialog"}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <TaskForm
                    ref={formRef}
                    listName={listName}
                    initialData={initialData || undefined}
                    onSubmit={onSubmit}
                    onCancel={onCancel}
                />
            </DialogContent>
        </Dialog>
    );
};
