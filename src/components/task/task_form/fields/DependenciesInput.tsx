import React from 'react';
import { Task } from '../../../../service/taskService';
import { MultiSelectInput } from '../../../library/MultiSelectInput';

interface DependenciesInputProps {
    name: string;
    control: any;
    label: string;
    availableTasks: Task[];
    initialDependencies: string[];
}

export const DependenciesInput: React.FC<DependenciesInputProps> = ({
    name,
    control,
    label,
    availableTasks,
    initialDependencies = [],
}) => {
    const items = availableTasks.map(task => ({
        id: task.id ?? '',
        label: task.title ?? '',
    }));

    return (
        <MultiSelectInput
            name={name}
            control={control}
            label={label}
            items={items}
            initialSelection={initialDependencies}
            placeholder="Select dependencies"
            searchPlaceholder="Search tasks..."
            allowCreate={false}
        />
    );
};
