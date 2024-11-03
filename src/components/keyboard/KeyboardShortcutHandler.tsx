import React, { useEffect } from 'react';
import Mousetrap from 'mousetrap';
import { useShortcuts } from 'src/components/context/ShortcutsContext';

export const KeyboardShortcutHandler: React.FC = () => {
    const { shortcuts, activeScope } = useShortcuts();

    useEffect(() => {
        Mousetrap.reset();
        const activeShortcuts = shortcuts.filter(shortcut => {
            return !shortcut.scope || shortcut.scope === activeScope;
        });

        console.log('Active scope:', activeScope);
        console.log('Active shortcuts:', activeShortcuts);

        activeShortcuts.forEach(shortcut => {
            Mousetrap.bind(shortcut.keys.join('+'), (event: KeyboardEvent) => {
                event.preventDefault();
                shortcut.action();
            });
        });

        return () => {
            Mousetrap.reset();
        };
    }, [shortcuts, activeScope]);

    return null;
};
