import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { Input } from 'src/components/ui/input';
import { TaskFormData } from '../taskFormData';

interface DurationFieldProps {
    control: Control<TaskFormData>;
}

export const DurationField: React.FC<DurationFieldProps> = ({ control }) => (
    <div>
        <fieldset>
            <legend className="block text-sm font-medium text-gray-700">
                Duration
            </legend>
            <div className="flex space-x-2">
                <Controller
                    name="durationHours"
                    control={control}
                    render={({ field }) => (
                        <Input
                            id="durationHours"
                            type="number"
                            min="0"
                            placeholder="Hours"
                            {...field}
                            value={field.value ?? 0}
                            onChange={e => {
                                const value =
                                    e.target.value === ''
                                        ? null
                                        : parseInt(e.target.value, 10);
                                field.onChange(value);
                            }}
                        />
                    )}
                />
                <Controller
                    name="durationMinutes"
                    control={control}
                    render={({ field }) => (
                        <Input
                            id="durationMinutes"
                            type="number"
                            min="0"
                            max="59"
                            placeholder="Minutes"
                            {...field}
                            value={field.value ?? 0}
                            onChange={e => {
                                const value =
                                    e.target.value === ''
                                        ? null
                                        : parseInt(e.target.value, 10);
                                field.onChange(value);
                            }}
                        />
                    )}
                />
            </div>
        </fieldset>
    </div>
);
