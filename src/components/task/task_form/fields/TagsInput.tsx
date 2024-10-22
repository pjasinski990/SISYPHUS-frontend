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

interface TagsInputProps {
    name: string;
    control: any;
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
    const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
    const [tagInputValue, setTagInputValue] = useState('');

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
                render={({ field }) => {
                    const filteredTags = Array.from(
                        availableTags.entries()
                    ).filter(
                        ([tag]) =>
                            !selectedTags.includes(tag) &&
                            tag
                                .toLowerCase()
                                .includes(tagInputValue.toLowerCase())
                    );

                    const showCreateOption =
                        tagInputValue.trim() !== '' &&
                        !availableTags.has(tagInputValue.trim()) &&
                        !selectedTags.includes(tagInputValue.trim());

                    return (
                        <div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        data-testid={`${name}-button`}
                                        className="w-full p-2 border rounded cursor-pointer flex flex-wrap gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        aria-haspopup="dialog"
                                        aria-expanded={selectedTags.length > 0}
                                    >
                                        {selectedTags.length > 0 ? (
                                            selectedTags.map(tag => (
                                                <Badge
                                                    key={tag}
                                                    className="mr-1 cursor-pointer"
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        const newSelectedTags =
                                                            selectedTags.filter(
                                                                t => t !== tag
                                                            );
                                                        setSelectedTags(
                                                            newSelectedTags
                                                        );
                                                        field.onChange(
                                                            newSelectedTags
                                                        );
                                                    }}
                                                >
                                                    {tag}
                                                    <span className="ml-1">
                                                        ✕
                                                    </span>
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-gray-500">
                                                Add or select tags
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
                                            placeholder="Type or select tags..."
                                            aria-label="Type or select tags"
                                            value={tagInputValue}
                                            onValueChange={setTagInputValue}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    if (
                                                        e.shiftKey &&
                                                        tagInputValue.trim() !==
                                                            ''
                                                    ) {
                                                        const newTag =
                                                            tagInputValue.trim();
                                                        if (
                                                            !selectedTags.includes(
                                                                newTag
                                                            )
                                                        ) {
                                                            const newSelectedTags =
                                                                [
                                                                    ...selectedTags,
                                                                    newTag,
                                                                ];
                                                            setSelectedTags(
                                                                newSelectedTags
                                                            );
                                                            field.onChange(
                                                                newSelectedTags
                                                            );
                                                        }
                                                        setTagInputValue('');
                                                        e.preventDefault();
                                                    }
                                                }
                                            }}
                                        />
                                        <CommandList>
                                            {filteredTags.map(
                                                ([tag, count]) => (
                                                    <CommandItem
                                                        key={tag}
                                                        onSelect={() => {
                                                            const newSelectedTags =
                                                                [
                                                                    ...selectedTags,
                                                                    tag,
                                                                ];
                                                            setSelectedTags(
                                                                newSelectedTags
                                                            );
                                                            field.onChange(
                                                                newSelectedTags
                                                            );
                                                            setTagInputValue(
                                                                ''
                                                            );
                                                        }}
                                                    >
                                                        <div className="flex items-center justify-between w-full">
                                                            <span>{tag}</span>
                                                            <span className="text-gray-500 text-sm">
                                                                {count} task
                                                                {count > 1
                                                                    ? 's'
                                                                    : ''}
                                                            </span>
                                                        </div>
                                                    </CommandItem>
                                                )
                                            )}
                                            {showCreateOption && (
                                                <CommandItem
                                                    key="create-new-tag"
                                                    onSelect={() => {
                                                        const newTag =
                                                            tagInputValue.trim();
                                                        const newSelectedTags =
                                                            [
                                                                ...selectedTags,
                                                                newTag,
                                                            ];
                                                        setSelectedTags(
                                                            newSelectedTags
                                                        );
                                                        field.onChange(
                                                            newSelectedTags
                                                        );
                                                        setTagInputValue('');
                                                    }}
                                                >
                                                    <div className="flex items-center">
                                                        <span>
                                                            Create &quot;
                                                            {tagInputValue.trim()}
                                                            &quot;
                                                        </span>
                                                    </div>
                                                </CommandItem>
                                            )}
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    );
                }}
            />
        </div>
    );
};
