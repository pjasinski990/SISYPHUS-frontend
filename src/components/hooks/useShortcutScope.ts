import { useEffect } from 'react';
import { useShortcuts } from '../context/ShortcutsContext';

export const useShortcutScope = (scopeName: string, active: boolean = true) => {
    const { pushScope, popScope } = useShortcuts();

    useEffect(() => {
        if (!active) {
            return
        }

        pushScope(scopeName);
        return () => {
            popScope();
        };
    }, [scopeName, pushScope, popScope, active]);
};
