import React from 'react';
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
    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <TaskForm
                    initialData={initialData || undefined}
                    onSubmit={onSubmit}
                    onCancel={onCancel}
                    hideReusableState={hideReusableState}
                />
            </DialogContent>
        </Dialog>
    );
};
