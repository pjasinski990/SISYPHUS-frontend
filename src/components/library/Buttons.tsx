import React from 'react';
import { Button } from 'src/components/ui/button';
import { ArrowRight, PlusCircle } from 'lucide-react';

export const ArrowRightButton: React.FC<{
    label?: string;
    onClick: () => void;
    className?: string;
}> = ({ label, onClick }) => {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={onClick}
            className={`flex items-center px-2 py-8 bg-emerald-100 dark:bg-emerald-700 hover:bg-emerald-200 dark:hover:bg-emerald-600 transition-colors duration-100`}
        >
            <ArrowRight className={`${label ? 'mr-1' : ''} h-4 w-4`} />{' '}
            {label && label}
        </Button>
    );
};

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
        >
            <PlusCircle className={`${label ? 'mr-1' : ''} h-4 w-4`} />{' '}
            {label && label}
        </Button>
    );
};
