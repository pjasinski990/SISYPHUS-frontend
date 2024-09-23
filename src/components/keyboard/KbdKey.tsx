import React from 'react';

interface KbdKeyProps {
    children: React.ReactNode;
}

const KbdKey: React.FC<KbdKeyProps> = ({ children }) => {
    return (
        <kbd
            className="inline-flex items-center px-2 py-1 text-xs font-mono text-gray-800 border border-gray-200 rounded-md shadow-sm"
            style={{background: '#FFFFF8'}}
        >
            {children}
        </kbd>
    );
};

export default KbdKey;
