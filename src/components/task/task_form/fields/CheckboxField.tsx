import React from 'react';
import { Control, Controller, Path } from 'react-hook-form';
import { Input } from '../../../ui/input';
import { TaskFormData } from '../taskFormData';

interface CheckboxFieldProps {
    name: Path<TaskFormData>;
    control: Control<TaskFormData>;
    label: string;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
    name,
    control,
    label,
    ...rest
}) => (
    <div className="flex items-center">
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <Input
                    type="checkbox"
                    id={name}
                    checked={!!field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    {...rest}
                />
            )}
        />
        <label
            htmlFor={name}
            className="pl-2 block text-sm font-medium text-gray-700"
        >
            {label}
        </label>
    </div>
);
