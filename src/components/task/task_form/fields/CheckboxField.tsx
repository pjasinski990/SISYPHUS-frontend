import React from 'react';
import { Controller } from 'react-hook-form';

interface CheckboxFieldProps {
    name: string;
    control: any;
    label: string;
    [key: string]: any;
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
                <input
                    type="checkbox"
                    id={name}
                    checked={field.value}
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
