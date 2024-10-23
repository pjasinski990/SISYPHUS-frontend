import React from 'react';
import { Control, Controller, FieldErrors, Path } from 'react-hook-form';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '../../../ui/tooltip';
import { Input } from '../../../ui/input';
import { TaskFormData } from '../taskFormData';

interface DeadlineFieldProps {
    name: Path<TaskFormData>;
    control: Control<TaskFormData>;
    label: string;
    enabled: boolean;
    errors: FieldErrors<TaskFormData>;
}

export const DeadlineField: React.FC<DeadlineFieldProps> = ({
    name,
    control,
    label,
    enabled,
    errors,
    ...rest
}) => (
    <div className="relative">
        <label
            htmlFor={name}
            className="block text-sm font-medium text-gray-700"
        >
            {label}
        </label>
        <Controller
            name={name}
            control={control}
            rules={{
                required: enabled ? 'Deadline is required' : false,
            }}
            render={({ field }) => (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div>
                                <Input
                                    {...field}
                                    id="deadline"
                                    name="deadline"
                                    type="datetime-local"
                                    value={
                                        typeof field.value === 'string'
                                            ? field.value
                                            : ''
                                    }
                                    placeholder="Select deadline"
                                    disabled={!enabled}
                                    {...rest}
                                />
                            </div>
                        </TooltipTrigger>
                        {!enabled && (
                            <TooltipContent>
                                Enable &quot;Has Deadline&quot; to set a
                                deadline.
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
            )}
        />
        {errors.deadline && (
            <p className="mt-1 text-sm text-red-600">
                {errors.deadline.message}
            </p>
        )}
    </div>
);
