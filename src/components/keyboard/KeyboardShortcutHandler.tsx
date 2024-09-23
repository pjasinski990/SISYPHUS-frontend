import React, { useEffect } from 'react';
import { useShortcuts, Shortcut } from 'src/components/context/ShortcutsContext';

const MODIFIER_KEYS = ['Ctrl', 'Shift', 'Alt', 'Meta'] as const;
type ModifierKey = typeof MODIFIER_KEYS[number];

const SPECIAL_KEY_MAP: Record<string, { additionalModifiers: ModifierKey[] }> = {
    '?': { additionalModifiers: ['Shift'] },
};

const KeyboardShortcuts: React.FC = () => {
    const { shortcuts } = useShortcuts();

    useEffect(() => {
        const sortedShortcuts = sortShortcutsByModifierCount(shortcuts);

        const handleKeyDown = (event: KeyboardEvent) => {
            if (isTypingInInput(event)) return;

            const pressedKey = normalizeKey(event.key);
            const activeModifiers = getActiveModifiers(event);

            for (const shortcut of sortedShortcuts) {
                const { mainKey, requiredModifiers } = parseShortcutKeys(shortcut.keys);

                const finalRequiredModifiers = applySpecialKeyModifiers(mainKey, requiredModifiers);

                if (
                    isKeyMatch(pressedKey, mainKey) &&
                    areModifiersMatching(activeModifiers, finalRequiredModifiers)
                ) {
                    event.preventDefault();
                    shortcut.action();
                    break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);

    return null;
};

export default KeyboardShortcuts;

const sortShortcutsByModifierCount = (shortcuts: Shortcut[]): Shortcut[] => {
    const getModifierCount = (keys: Shortcut['keys']) =>
        keys.filter((key) => MODIFIER_KEYS.includes(key as ModifierKey)).length;

    return [...shortcuts].sort((a, b) => getModifierCount(b.keys) - getModifierCount(a.keys));
};

const normalizeKey = (key: string): string => {
    return key.length === 1 ? key.toUpperCase() : key;
};

const getActiveModifiers = (event: KeyboardEvent): Set<ModifierKey> => {
    const activeModifiers = new Set<ModifierKey>();
    if (event.ctrlKey) activeModifiers.add('Ctrl');
    if (event.shiftKey) activeModifiers.add('Shift');
    if (event.altKey) activeModifiers.add('Alt');
    if (event.metaKey) activeModifiers.add('Meta');
    return activeModifiers;
};

const parseShortcutKeys = (keys: Shortcut['keys']): { mainKey: string; requiredModifiers: ModifierKey[] } => {
    const mainKey = keys.find((key) => !MODIFIER_KEYS.includes(key as ModifierKey))?.toUpperCase() || '';
    const requiredModifiers = keys.filter((key) => MODIFIER_KEYS.includes(key as ModifierKey)) as ModifierKey[];
    return { mainKey, requiredModifiers };
};

const applySpecialKeyModifiers = (
    mainKey: string,
    requiredModifiers: ModifierKey[]
): ModifierKey[] => {
    if (SPECIAL_KEY_MAP[mainKey]) {
        return [...requiredModifiers, ...SPECIAL_KEY_MAP[mainKey].additionalModifiers];
    }
    return requiredModifiers;
};

const isKeyMatch = (pressedKey: string, shortcutKey: string): boolean => {
    return pressedKey === shortcutKey;
};

const areModifiersMatching = (
    activeModifiers: Set<ModifierKey>,
    requiredModifiers: ModifierKey[]
): boolean => {
    const allRequiredModifiersActive = requiredModifiers.every((mod) => activeModifiers.has(mod));

    const noExtraModifiers = activeModifiers.size === requiredModifiers.length;

    return allRequiredModifiersActive && noExtraModifiers;
};

const isTypingInInput = (event: KeyboardEvent): boolean => {
    const target = event.target as HTMLElement;
    return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
};
