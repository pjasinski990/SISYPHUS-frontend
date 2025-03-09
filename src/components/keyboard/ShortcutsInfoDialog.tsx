import React, { useCallback, useMemo, useState } from 'react';
import { Button } from 'src/components/ui/button';
import { Keyboard } from 'lucide-react';

import ShortcutsList from './ShortcutsList';
import { Shortcut } from 'src/components/context/ShortcutsContext';
import { useRegisterShortcut } from 'src/components/hooks/useRegisterShortcut';
import { BaseDialog } from '../dialog/BaseDialog';

const ShortcutsInfoDialog: React.FC = () => {
    const [open, setOpen] = useState(false);

    const openDialog = useCallback(() => {
        setOpen(true);
    }, []);

    const openInfoDialogShortcut: Shortcut = useMemo(
        () => ({
            id: 'open-shortcut-info-dialog',
            keys: ['?'],
            action: openDialog,
            description: 'Open keyboard shortcuts dialog',
            order: 2,
        }),
        [openDialog]
    );

    useRegisterShortcut(openInfoDialogShortcut);

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                aria-label="Shortcuts info"
                onClick={openDialog}
                className="flex items-center space-x-2 dark:hover:bg-slate-700"
            >
                <Keyboard className="h-4 w-4" />
                <span>Shortcuts</span>
            </Button>

            <BaseDialog
                open={open}
                onCancel={() => setOpen(false)}
                title="Keyboard Shortcuts"
                description="List of shortcuts"
                contentClassName={'min-w-[600px]'}
            >
                <ShortcutsList />

                <div className="flex justify-end mt-4">
                    <Button onClick={() => setOpen(false)}>Close</Button>
                </div>
            </BaseDialog>
        </>
    );
};

export default ShortcutsInfoDialog;
