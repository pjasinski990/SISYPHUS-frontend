import React, { ReactNode } from 'react';
import { ShortcutsContext, ShortcutsContextType } from '../../src/components/context/ShortcutsContext';
import { vi } from 'vitest';

interface MockShortcutsProviderProps {
    children: ReactNode;
    value?: Partial<ShortcutsContextType>;
}

export const MockShortcutsProvider: React.FC<MockShortcutsProviderProps> = ({ children, value = {} }) => {
    const defaultValue: ShortcutsContextType = {
        shortcuts: [],
        setShortcuts: vi.fn(),
        pushScope: vi.fn(),
        popScope: vi.fn(),
        activeScope: 'someScope',
        ...value,
    };

    return (
        <ShortcutsContext.Provider value={defaultValue}>
            {children}
        </ShortcutsContext.Provider>
    );
};
