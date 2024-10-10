import React, { useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import { Button } from 'src/components/ui/button';
import { ReceiptText, SquareSplitHorizontal } from 'lucide-react';
import './ContextMenu.css';

interface ContextMenuProps {
    show: boolean;
    position: { x: number; y: number };
    onClose: () => void;
    onShowDetails: () => void;
    onUnravel: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
    show,
    position,
    onClose,
    onShowDetails,
    onUnravel,
}) => {
    const transitionNodeRef = useRef(null);
    return (
        <CSSTransition
            nodeRef={transitionNodeRef}
            in={show}
            timeout={100}
            classNames="context-menu"
            unmountOnExit
        >
            <div
                className="context-menu fixed min-w-48 z-[1000] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded shadow-lg"
                ref={transitionNodeRef}
                style={{
                    top: position.y,
                    left: position.x,
                }}
                onClick={e => e.stopPropagation()}
            >
                <Button
                    variant="outline"
                    size="sm"
                    onClick={e => {
                        e.stopPropagation();
                        onShowDetails();
                        onClose();
                    }}
                    className="w-full flex items-center justify-start px-3 py-2 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors duration-100"
                >
                    <ReceiptText className="h-4 w-4 mr-2" /> Show Details
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={e => {
                        e.stopPropagation();
                        onUnravel();
                        onClose();
                    }}
                    className="w-full flex items-center justify-start px-3 py-2 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors duration-100"
                >
                    <SquareSplitHorizontal className="h-4 w-4 mr-2" /> Unravel
                    Task
                </Button>
            </div>
        </CSSTransition>
    );
};
