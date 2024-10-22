import React from 'react';
import { Controller } from 'react-hook-form';
import { Slider } from 'src/components/ui/slider';
import { Input } from 'src/components/ui/input';

interface FlexibilitySliderProps {
    control: any;
    getFlexibilityMessage: (value: number) => string;
}

export const FlexibilitySlider: React.FC<FlexibilitySliderProps> = ({
    control,
    getFlexibilityMessage,
}) => (
    <div>
        <label
            htmlFor="flexibility"
            className="block text-sm font-medium text-gray-700"
        >
            Flexibility
        </label>
        <Controller
            name="flexibility"
            control={control}
            render={({ field }) => (
                <div>
                    <div className="flex items-center space-x-4">
                        <Slider
                            id="flexibility-slider"
                            name="flexibility-slider"
                            min={0}
                            max={1}
                            step={0.05}
                            value={[field.value ?? 0]}
                            onValueChange={value => field.onChange(value[0])}
                            className="flex-1"
                        />
                        <Input
                            type="number"
                            id="flexibility"
                            name="flexibility"
                            min="0"
                            max="1"
                            step="0.01"
                            value={field.value ?? ''}
                            onChange={e =>
                                field.onChange(
                                    e.target.value === ''
                                        ? null
                                        : parseFloat(e.target.value)
                                )
                            }
                            className="w-20"
                        />
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                        {getFlexibilityMessage(field.value ?? 0)}
                    </p>
                </div>
            )}
        />
    </div>
);
