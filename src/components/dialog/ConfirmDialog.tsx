import React, { useEffect, useState } from 'react';
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
    const [visibleMessage, setVisibleMessage] = useState<string>(message);
    const [visibleChildren, setVisibleChildren] =
        useState<React.ReactNode>(children);

    useEffect(() => {
        if (open) {
            setVisibleMessage(message);
            setVisibleChildren(children);
        } else {
            const timer = setTimeout(() => {
                setVisibleMessage('');
                setVisibleChildren(null);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [open, message, children]);

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
                <p className="mb-4">
                    {visibleMessage || 'Are you sure you want to proceed?'}
                </p>
                {visibleChildren}
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
