import React, { useCallback, useMemo } from 'react';
import { Button } from 'src/components/ui/button';
import { Keyboard } from 'lucide-react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from 'src/components/ui/dialog';
import ShortcutsList from './ShortcutsList';
import { Description } from '@radix-ui/react-dialog';
import { Shortcut } from 'src/components/context/ShortcutsContext';
import { useRegisterShortcut } from 'src/components/hooks/useRegisterShortcut';

const ShortcutsInfoDialog: React.FC = () => {
    const [open, setOpen] = React.useState(false);

    const openDialog = useCallback(() => {
        setOpen(true);
    }, []);

    const platform = navigator.userAgent.toLowerCase();
    const isMac = platform.includes('darwin') || platform.includes('mac');
    const openInfoDialogShortcut: Shortcut = useMemo(
        () => ({
            id: 'open-shortcut-info-dialog',
            keys: isMac ? ['Meta', '?'] : ['Ctrl', '?'],
            action: openDialog,
            description: 'Open keyboard shortcuts dialog',
            order: 2,
        }),
        [isMac, openDialog]
    );
    useRegisterShortcut(openInfoDialogShortcut);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    aria-label={'Shortcuts info'}
                    className="flex items-center space-x-2 dark:hover:bg-slate-700"
                >
                    <Keyboard className="h-4 w-4" />
                    <span>Shortcuts</span>
                </Button>
            </DialogTrigger>
            <DialogDescription className={'hidden'}>
                List of shortcuts
            </DialogDescription>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Keyboard Shortcuts</DialogTitle>
                </DialogHeader>
                <Description />
                <ShortcutsList />
                <DialogFooter>
                    <DialogClose asChild>
                        <Button onClick={() => setOpen(false)}>Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ShortcutsInfoDialog;
