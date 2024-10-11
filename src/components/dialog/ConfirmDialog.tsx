import React from 'react';
import { BaseDialog } from './BaseDialog';
import { Button } from 'src/components/ui/button';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    children?: React.ReactNode;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    open,
    title,
    message,
    onConfirm,
    onCancel,
    children,
}) => {
    const extraKeyHandlers = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            onConfirm();
        }
    };

    return (
        <BaseDialog
            open={open}
            onCancel={onCancel}
            title={title}
            description="Confirmation"
            extraKeyHandlers={extraKeyHandlers}
            closeAnimationDuration={500}
        >
            <div>
                <p className="mb-4">{message}</p>
                {children}
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <Button onClick={onCancel}>Cancel</Button>
                <Button variant="destructive" onClick={onConfirm}>
                    Remove
                </Button>
            </div>
        </BaseDialog>
    );
};
