import React from 'react';
import { Control, Controller, Path } from 'react-hook-form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from 'src/components/ui/select';
import { TaskFormData } from '../taskFormData';

interface SelectFieldProps {
    name: Path<TaskFormData>;
    control: Control<TaskFormData>;
    label: string;
    options: { value: string; label: string }[];
    placeholder?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
    name,
    control,
    label,
    options,
    placeholder,
    ...rest
}) => (
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
                <Select
                    onValueChange={field.onChange}
                    value={typeof field.value === 'string' ? field.value : ''}
                    {...rest}
                >
                    <SelectTrigger id={name}>
                        <SelectValue placeholder={placeholder}>
                            {field.value}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {options.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        />
    </div>
);
