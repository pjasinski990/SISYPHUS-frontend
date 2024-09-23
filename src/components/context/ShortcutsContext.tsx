import React, { createContext, useContext, useState, ReactNode } from 'react';

type ModifierKey = 'Ctrl' | 'Shift' | 'Alt' | 'Meta';
export type Key = ModifierKey | string;

export interface Shortcut {
    id: string;
    keys: Key[];
    action: () => void;
    description?: string;
    order?: number;
}

interface ShortcutsContextType {
    shortcuts: Shortcut[];
    setShortcuts: React.Dispatch<React.SetStateAction<Shortcut[]>>;
}

const ShortcutsContext = createContext<ShortcutsContextType | undefined>(undefined);

export const useShortcuts = () => {
    const context = useContext(ShortcutsContext);
    if (!context) {
        throw new Error('useShortcuts must be used within a ShortcutsProvider');
    }
    return context;
};

export const ShortcutsProvider = ({ children }: { children: ReactNode }) => {
    const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);

    return (
        <ShortcutsContext.Provider value={{ shortcuts, setShortcuts }}>
            {children}
        </ShortcutsContext.Provider>
    );
};
