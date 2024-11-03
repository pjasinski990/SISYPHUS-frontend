import React from 'react';
import { Control, Controller, Path, RegisterOptions } from 'react-hook-form';
import { Input } from 'src/components/ui/input';
import { TaskFormData } from '../taskFormData';

interface TextInputFieldProps {
    name: Path<TaskFormData>;
    control: Control<TaskFormData>;
    label: string;
    placeholder?: string;
    rules?: RegisterOptions<TaskFormData>;
    errors?: Record<string, { message: string }>;
    type?: string
}

export const TextInputField: React.FC<TextInputFieldProps> = ({
    name,
    control,
    label,
    placeholder,
    rules,
    errors,
    ...rest
}) => {
    return (
        <div className="space-y-2">
            <label htmlFor={name}>{label}</label>
            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field }) => (
                    <>
                        <Input
                            id={name}
                            placeholder={placeholder}
                            {...rest}
                            {...field}
                            value={field.value?.toString() ?? ''}
                            onChange={e => {
                                const value = e.target.value;
                                field.onChange(value === '' ? null : value);
                            }}
                        />
                        {errors?.[name] && (
                            <p className="text-sm text-red-500">
                                {errors[name].message}
                            </p>
                        )}
                    </>
                )}
            />
        </div>
    );
};
