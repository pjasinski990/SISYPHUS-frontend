import React from 'react';
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
    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
            <DialogContent>
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
