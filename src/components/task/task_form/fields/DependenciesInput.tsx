import React, { useState } from 'react';
import { Controller } from 'react-hook-form';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from 'src/components/ui/popover';
import {
    Command,
    CommandInput,
    CommandItem,
    CommandList,
} from 'src/components/ui/command';
import { Badge } from 'src/components/ui/badge';
import { Task } from '../../../../service/taskService';

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
    const [selectedDependencies, setSelectedDependencies] =
        useState<string[]>(initialDependencies);
    const [dependencyInputValue, setDependencyInputValue] = useState('');

    return (
        <div>
            <label
                htmlFor={name}
                className="block text-sm font-medium text-gray-700"
            >
                {label}
            </label>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    data-testid={`${name}-button`}
                                    className="w-full p-2 border rounded cursor-pointer flex flex-wrap gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-haspopup="dialog"
                                    aria-expanded={
                                        selectedDependencies.length > 0
                                    }
                                >
                                    {selectedDependencies.length > 0 ? (
                                        selectedDependencies.map(id => {
                                            const task = availableTasks.find(
                                                t => t.id === id
                                            );
                                            return (
                                                <Badge
                                                    key={id}
                                                    className="mr-1 cursor-pointer"
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        const newSelectedDependencies =
                                                            selectedDependencies.filter(
                                                                depId =>
                                                                    depId !== id
                                                            );
                                                        setSelectedDependencies(
                                                            newSelectedDependencies
                                                        );
                                                        field.onChange(
                                                            newSelectedDependencies
                                                        );
                                                    }}
                                                >
                                                    {task?.title || id}
                                                    <span className="ml-1">
                                                        ✕
                                                    </span>
                                                </Badge>
                                            );
                                        })
                                    ) : (
                                        <span className="text-gray-500">
                                            Select dependencies
                                        </span>
                                    )}
                                </button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-full p-0"
                                role="dialog"
                                aria-modal="true"
                                onKeyDown={e => {
                                    if (e.key === 'Escape') {
                                        e.stopPropagation();
                                    }
                                }}
                            >
                                <Command>
                                    <CommandInput
                                        placeholder="Search tasks..."
                                        aria-label="Search tasks"
                                        value={dependencyInputValue}
                                        onValueChange={setDependencyInputValue}
                                    />
                                    <CommandList>
                                        {availableTasks
                                            .filter(task =>
                                                task.title
                                                    .toLowerCase()
                                                    .includes(
                                                        dependencyInputValue.toLowerCase()
                                                    )
                                            )
                                            .map(task => {
                                                if (!task.id) return null;
                                                const taskId = task.id;
                                                const isSelected =
                                                    selectedDependencies.includes(
                                                        taskId
                                                    );
                                                return (
                                                    <CommandItem
                                                        key={taskId}
                                                        onSelect={() => {
                                                            let newValue: string[];
                                                            if (isSelected) {
                                                                newValue =
                                                                    selectedDependencies.filter(
                                                                        id =>
                                                                            id !==
                                                                            taskId
                                                                    );
                                                            } else {
                                                                newValue = [
                                                                    ...selectedDependencies,
                                                                    taskId,
                                                                ];
                                                            }
                                                            setSelectedDependencies(
                                                                newValue
                                                            );
                                                            field.onChange(
                                                                newValue
                                                            );
                                                        }}
                                                    >
                                                        <div className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    isSelected
                                                                }
                                                                readOnly
                                                                className="mr-2"
                                                                aria-label={
                                                                    isSelected
                                                                        ? `Deselect ${task.title}`
                                                                        : `Select ${task.title}`
                                                                }
                                                            />
                                                            {task.title}
                                                        </div>
                                                    </CommandItem>
                                                );
                                            })}
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                )}
            />
        </div>
    );
};
