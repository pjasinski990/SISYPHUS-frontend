import React, { useEffect } from 'react';

type ModifierKey = 'Ctrl' | 'Shift' | 'Alt';
type Key = ModifierKey | string;

interface Shortcut {
    keys: Key[];
    action: () => void;
}

interface KeyboardShortcutsProps {
    shortcuts: Shortcut[];
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ shortcuts }) => {
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
