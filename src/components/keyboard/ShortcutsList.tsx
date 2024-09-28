import React from 'react';
import {
    useShortcuts,
    Shortcut,
    Key,
} from 'src/components/context/ShortcutsContext';
import KbdKey from 'src/components/keyboard/KbdKey';

const ShortcutsList: React.FC = () => {
    const { shortcuts } = useShortcuts();

    const renderKeys = (keys: Key[]) => {
        return keys.map((key, index) => (
            <React.Fragment key={index}>
                <KbdKey>{key}</KbdKey>
                {index < keys.length - 1 && <span className="mx-1">+</span>}
            </React.Fragment>
        ));
    };

    const shortcutsSorted = shortcuts.sort((a, b) => {
        const orderA = a.order ? a.order : 0;
        const orderB = b.order ? b.order : 0;
        return orderA - orderB;
    });
    return (
        <div className="mt-4">
            <ul className="space-y-4">
                {shortcutsSorted.map((shortcut: Shortcut) => (
                    <li key={shortcut.id} className="flex items-baseline">
                        <div className="flex items-center space-x-1 mr-4">
                            {renderKeys(shortcut.keys)}
                        </div>
                        <div className="font-mono text-sm">
                            {' '}
                            -{' '}
                            {shortcut.description || 'No description available'}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ShortcutsList;
