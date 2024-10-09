import React from 'react';

export const LoadingPlaceholder: React.FC = () => {
    return (
        <div className="animate-pulse space-y-4 min-w-[600px]">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mx-auto"></div>

            <div className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4/5"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
        </div>
    );
};

export const TaskLoadingPlaceholder: React.FC<{ nTasks: number }> = ({
    nTasks,
}) => {
    return (
        <div className="animate-pulse space-y-4 min-w-[400px]">
            {Array.from({ length: nTasks }).map((_, index) => (
                <div key={index} className="space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4/5"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
            ))}
        </div>
    );
};
