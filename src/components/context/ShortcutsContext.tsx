import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';

type ModifierKey = 'ctrl' | 'shift' | 'alt' | 'meta';
export type Key = ModifierKey | string;

export interface Shortcut {
    id: string;
    keys: Key[];
    action: () => void;
    description?: string;
    order?: number;
    scope?: string;
}

interface ShortcutsContextType {
    shortcuts: Shortcut[];
    setShortcuts: React.Dispatch<React.SetStateAction<Shortcut[]>>;
    pushScope: (scope: string) => void;
    popScope: () => void;
    activeScope: string | undefined;
}

export const ShortcutsContext = createContext<ShortcutsContextType | undefined>(
    undefined
);

export const useShortcuts = () => {
    const context = useContext(ShortcutsContext);
    if (!context) {
        throw new Error('useShortcuts must be used within a ShortcutsProvider');
    }
    return context;
};

export const ShortcutsProvider = ({ children }: { children: ReactNode }) => {
    const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
    const [scopeStack, setScopeStack] = useState<string[]>([]);

    const pushScope = useCallback((scope: string) => {
        setScopeStack(prevStack => [...prevStack, scope]);
    }, []);

    const popScope = useCallback(() => {
        setScopeStack(prevStack => prevStack.slice(0, -1));
    }, []);

    const activeScope = scopeStack[scopeStack.length - 1];

    return (
        <ShortcutsContext.Provider
            value={{
                shortcuts,
                setShortcuts,
                pushScope,
                popScope,
                activeScope,
            }}
        >
            {children}
        </ShortcutsContext.Provider>
    );
};
