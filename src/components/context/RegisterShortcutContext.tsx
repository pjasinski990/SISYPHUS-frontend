import { useEffect } from 'react';
import { useShortcuts, Shortcut } from './ShortcutsContext';

export const useRegisterShortcut = (shortcut: Shortcut) => {
    const { setShortcuts } = useShortcuts();

    useEffect(() => {
        setShortcuts(prevShortcuts => [...prevShortcuts, shortcut]);
        return () => {
            setShortcuts(prevShortcuts => prevShortcuts.filter(s => s.id !== shortcut.id));
        };
    }, [setShortcuts, shortcut]);
};
