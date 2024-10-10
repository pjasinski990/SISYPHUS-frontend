import React, { ReactNode, useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent, DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from 'src/components/ui/dialog';
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
    const [currentMessage, setCurrentMessage] = useState<string | null>(null);
    const [currentChildren, setCurrentChildren] = useState<ReactNode | null>(
        null
    );

    useEffect(() => {
        if (open) {
            setCurrentMessage(message);
            setCurrentChildren(children);
        } else if (message && children) {
            const timer = setTimeout(() => {
                setCurrentChildren(null);
                setCurrentMessage(null);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [open, children, message]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                event.stopPropagation();
                onConfirm();
            } else if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                onCancel();
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
    }, [open, onConfirm, onCancel]);

    if (!currentChildren) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={isOpen => !isOpen && onCancel()}>
            <DialogDescription className={'hidden'}>
                Confirmation
            </DialogDescription>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div>
                    <p className="mb-4">{currentMessage}</p>
                    {currentChildren}
                </div>
                <DialogFooter>
                    <Button onClick={onCancel}>Cancel</Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        Remove
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
