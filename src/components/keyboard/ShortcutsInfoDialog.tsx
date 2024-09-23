import React from 'react';
import { Button } from 'src/components/ui/button';
import { Keyboard } from 'lucide-react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from 'src/components/ui/dialog';
import ShortcutsList from './ShortcutsList';

const ShortcutsInfoDialog: React.FC = () => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 dark:hover:bg-slate-700"
                >
                    <Keyboard className="h-4 w-4" />
                    <span>Shortcuts</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Keyboard Shortcuts</DialogTitle>
                </DialogHeader>
                <ShortcutsList />
                <DialogFooter>
                    <DialogClose asChild>
                        <Button>Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ShortcutsInfoDialog;
