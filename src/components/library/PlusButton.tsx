import React from "react";
import { Button } from "src/components/ui/button";
import { PlusCircle } from "lucide-react";

export const PlusButton: React.FC<{
    label?: string,
    onClick: () => void,
}> = ({label, onClick}) => {

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={onClick}
            className="flex items-center dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200"
        >
            <PlusCircle className={`${label ? 'mr-1' : ''} h-4 w-4`} /> {label && label}
        </Button>
    )
}
