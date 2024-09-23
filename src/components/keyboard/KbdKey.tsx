import React from 'react';

interface KbdKeyProps {
    children: React.ReactNode;
}

const KbdKey: React.FC<KbdKeyProps> = ({ children }) => {
    return (
        <kbd className="inline-flex items-center px-3 py-1.5 text-xs font-mono text-gray-800 bg-gray-100 border border-gray-200 rounded-md shadow-sm">
            {children}
        </kbd>
    );
};

export default KbdKey;
