import React from 'react';

interface KbdKeyProps {
    children: React.ReactNode;
}

const KbdKey: React.FC<KbdKeyProps> = ({ children }) => {
    return (
        <div
            className="bg-gray-200 rounded-md border-r-gray-400 border-gray-300 border-r-4 border-b-4 flex items-start"
            style={{ borderTopLeftRadius: '6px' }}
        >
            <kbd
                className="inline-flex items-center px-2 pt-1 pb-0.5 text-xs font-mono text-gray-800 border border-gray-100 rounded-md shadow-sm"
                style={{ background: '#FFFFF8' }}
            >
                {children}
            </kbd>
        </div>
    );
};

export default KbdKey;
