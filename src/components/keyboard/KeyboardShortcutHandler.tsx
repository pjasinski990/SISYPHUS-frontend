import React, { useEffect } from 'react';
import { useShortcuts } from "src/components/context/ShortcutsContext";

const KeyboardShortcuts: React.FC = () => {
    const { shortcuts } = useShortcuts();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const { key, ctrlKey, shiftKey, altKey } = event;

            shortcuts.forEach(({ keys, action }) => {
                const matchesShortcut = keys.every(k =>
                    (k === 'Ctrl' && ctrlKey) ||
                    (k === 'Shift' && shiftKey) ||
                    (k === 'Alt' && altKey) ||
                    k.toLowerCase() === key.toLowerCase()
                );

                if (matchesShortcut) {
                    event.preventDefault();
                    action();
                }
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);

    return null;
};

export default KeyboardShortcuts;
