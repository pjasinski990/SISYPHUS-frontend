import React from 'react';
import { Controller } from 'react-hook-form';
import { Input } from 'src/components/ui/input';

interface TextInputFieldProps {
    name: string;
    control: any;
    label: string;
    placeholder?: string;
    rules?: any;
    errors?: any;
    [key: string]: any;
}

export const TextInputField: React.FC<TextInputFieldProps> = ({
    name,
    control,
    label,
    placeholder,
    rules,
    errors,
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
            rules={rules}
            render={({ field }) => (
                <>
                    <Input
                        id={name}
                        placeholder={placeholder}
                        {...field}
                        {...rest}
                    />
                    {errors && errors[name] && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors[name].message}
                        </p>
                    )}
                </>
            )}
        />
    </div>
);
