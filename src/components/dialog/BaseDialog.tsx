import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from 'src/components/ui/dialog';

interface BaseDialogProps {
    open: boolean;
    onCancel: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    onSubmit?: () => void;
    submitOnCtrlEnter?: boolean;
    closeOnEscape?: boolean;
    closeAnimationDuration?: number;
    extraKeyHandlers?: (event: KeyboardEvent) => void;
    contentClassName?: string;
}

export const BaseDialog: React.FC<BaseDialogProps> = ({
    open,
    onCancel,
    title,
    description,
    children,
    onSubmit,
    submitOnCtrlEnter = false,
    closeOnEscape = true,
    closeAnimationDuration = 500,
    extraKeyHandlers,
    contentClassName,
}) => {
    const [isRendered, setIsRendered] = useState<boolean>(false);

    useEffect(() => {
        if (open) {
            setIsRendered(true);
        } else {
            const timer = setTimeout(() => {
                setIsRendered(false);
            }, closeAnimationDuration);
            return () => clearTimeout(timer);
        }
    }, [open, closeAnimationDuration]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (submitOnCtrlEnter && event.ctrlKey && event.key === 'Enter') {
                event.preventDefault();
                event.stopPropagation();
                if (onSubmit) onSubmit();
            } else if (closeOnEscape && event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                onCancel();
            }
            if (extraKeyHandlers) extraKeyHandlers(event);
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
    }, [
        open,
        onCancel,
        onSubmit,
        submitOnCtrlEnter,
        closeOnEscape,
        extraKeyHandlers,
    ]);

    if (!isRendered) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={isOpen => !isOpen && onCancel()}>
            <DialogDescription className={'hidden'}>
                {description || title}
            </DialogDescription>
            <DialogContent className={contentClassName}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
};
