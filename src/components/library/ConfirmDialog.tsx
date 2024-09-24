import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "src/components/ui/dialog";
import { Button } from "src/components/ui/button";

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
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                onConfirm();
            } else if (event.key === 'Escape') {
                event.preventDefault();
                onCancel();
            }
        };

        if (open) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, onConfirm, onCancel]);

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
            <DialogContent aria-describedby={"confirmation"}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div>
                    <p className="mb-4">{message}</p>
                    {children}
                </div>
                <DialogFooter>
                    <Button onClick={onCancel}>Cancel</Button>
                    <Button variant="destructive" onClick={onConfirm}>Remove</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
