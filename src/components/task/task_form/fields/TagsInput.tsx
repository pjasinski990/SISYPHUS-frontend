import React from 'react';
import { MultiSelectInput } from '../../../library/MultiSelectInput';
import { Control, Path } from 'react-hook-form';
import { TaskFormData } from '../taskFormData';

interface TagsInputProps {
    name: Path<TaskFormData>;
    control: Control<TaskFormData>;
    label: string;
    availableTags: Map<string, number>;
    initialTags: string[];
}

export const TagsInput: React.FC<TagsInputProps> = ({
    name,
    control,
    label,
    availableTags,
    initialTags = [],
}) => {
    const items = Array.from(availableTags.entries()).map(([tag, count]) => ({
        id: tag,
        label: tag,
        metadata: `${count} task${count > 1 ? 's' : ''}`,
    }));

    return (
        <MultiSelectInput
            name={name}
            control={control}
            label={label}
            items={items}
            initialSelection={initialTags}
            placeholder="Add or select tags"
            searchPlaceholder="Type or select tags..."
            allowCreate={true}
        />
    );
};
