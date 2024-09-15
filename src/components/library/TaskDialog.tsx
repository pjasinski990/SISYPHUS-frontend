import React, { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "src/components/ui/dialog";
import { TaskForm, TaskFormData } from "src/components/library/TaskForm";
import { Task } from "../../service/taskService";

interface TaskDialogProps {
    open: boolean;
    initialData?: Task | null;
    hideReusableState?: boolean;
    onSubmit: (taskData: TaskFormData) => void;
    onCancel: () => void;
    title: string;
}

export const TaskDialog: React.FC<TaskDialogProps> = ({
                                                          open,
                                                          initialData,
                                                          hideReusableState = false,
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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <TaskForm
                    ref={formRef}
                    initialData={initialData || undefined}
                    onSubmit={onSubmit}
                    onCancel={onCancel}
                    hideReusableState={hideReusableState}
                />
            </DialogContent>
        </Dialog>
    );
};
