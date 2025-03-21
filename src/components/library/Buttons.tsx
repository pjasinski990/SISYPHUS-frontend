import React from 'react';
import { Button } from 'src/components/ui/button';
import { PlusCircle } from 'lucide-react';

export const PlusButton: React.FC<{
    label?: string;
    onClick: () => void;
    className?: string;
}> = ({ label, onClick }) => {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={onClick}
            className={`flex items-center bg-emerald-100 dark:bg-emerald-700 hover:bg-emerald-200 dark:hover:bg-emerald-600 transition-colors duration-100`}
            aria-label={`${label}`}
        >
            <PlusCircle className={`${label ? 'mr-1' : ''} h-4 w-4`} />{' '}
            {label && label}
        </Button>
    );
};
