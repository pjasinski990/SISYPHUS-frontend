import { ChevronRight } from 'lucide-react';
import React from 'react';

export const SlidingPanelToggleRibbon: React.FC<{
    toggleOpen: () => void;
    isOpen: boolean;
}> = ({ toggleOpen, isOpen }) => {
    return (
        <div
            onClick={toggleOpen}
            className={`h-full w-8 bg-white hover:bg-slate-50 dark:bg-slate-950 hover:dark:bg-slate-900 flex items-center justify-center cursor-pointer ${isOpen ? 'mr-[20px] ml-[1px]' : 'mr-[1px]'}`}
        >
            <ChevronRight
                size={24}
                className={`text-slate-500 transition-transform duration-200 ${
                    isOpen ? 'rotate-0' : 'rotate-180'
                }`}
            />
        </div>
    );
};
