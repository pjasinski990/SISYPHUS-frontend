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

interface Item {
    id: string;
    label: string;
    metadata?: string | number;
}

interface MultiSelectInputProps {
    name: string;
    control: any;
    label: string;
    items: Item[];
    initialSelection?: string[];
    placeholder?: string;
    searchPlaceholder?: string;
    allowCreate?: boolean;
    renderItem?: (item: Item) => React.ReactNode;
    onCreateItem?: (value: string) => void;
}

export const MultiSelectInput: React.FC<MultiSelectInputProps> = ({
    name,
    control,
    label,
    items,
    initialSelection = [],
    placeholder = 'Select items',
    searchPlaceholder = 'Search items...',
    allowCreate = false,
    renderItem,
    onCreateItem,
}) => {
    const [selectedIds, setSelectedIds] = useState<string[]>(initialSelection);
    const [inputValue, setInputValue] = useState('');

    const defaultRenderItem = (item: Item) => (
        <div className="flex items-center justify-between w-full">
            <span>{item.label}</span>
            {item.metadata && (
                <span className="text-gray-500 text-sm">{item.metadata}</span>
            )}
        </div>
    );

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
                    const filteredItems = items.filter(
                        item =>
                            !selectedIds.includes(item.id) &&
                            item.label
                                .toLowerCase()
                                .includes(inputValue.toLowerCase())
                    );

                    const showCreateOption =
                        allowCreate &&
                        inputValue.trim() !== '' &&
                        !items.some(
                            item =>
                                item.label.toLowerCase() ===
                                inputValue.toLowerCase()
                        ) &&
                        !selectedIds.includes(inputValue.trim());

                    return (
                        <div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        data-testid={`${name}-button`}
                                        className="w-full p-2 border rounded cursor-pointer flex flex-wrap gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        aria-haspopup="dialog"
                                        aria-expanded={selectedIds.length > 0}
                                    >
                                        {selectedIds.length > 0 ? (
                                            selectedIds.map(id => {
                                                const item = items.find(
                                                    i => i.id === id
                                                );
                                                return (
                                                    <Badge
                                                        key={id}
                                                        className="mr-1 cursor-pointer"
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            const newSelectedIds =
                                                                selectedIds.filter(
                                                                    selectedId =>
                                                                        selectedId !==
                                                                        id
                                                                );
                                                            setSelectedIds(
                                                                newSelectedIds
                                                            );
                                                            field.onChange(
                                                                newSelectedIds
                                                            );
                                                        }}
                                                    >
                                                        {item?.label || id}
                                                        <span className="ml-1">
                                                            ✕
                                                        </span>
                                                    </Badge>
                                                );
                                            })
                                        ) : (
                                            <span className="text-gray-500">
                                                {placeholder}
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
                                            placeholder={searchPlaceholder}
                                            value={inputValue}
                                            onValueChange={setInputValue}
                                            onKeyDown={e => {
                                                if (
                                                    allowCreate &&
                                                    e.key === 'Enter' &&
                                                    e.shiftKey &&
                                                    inputValue.trim() !== ''
                                                ) {
                                                    const newValue =
                                                        inputValue.trim();
                                                    if (
                                                        !selectedIds.includes(
                                                            newValue
                                                        )
                                                    ) {
                                                        onCreateItem?.(
                                                            newValue
                                                        );
                                                        const newSelectedIds = [
                                                            ...selectedIds,
                                                            newValue,
                                                        ];
                                                        setSelectedIds(
                                                            newSelectedIds
                                                        );
                                                        field.onChange(
                                                            newSelectedIds
                                                        );
                                                    }
                                                    setInputValue('');
                                                    e.preventDefault();
                                                }
                                            }}
                                        />
                                        <CommandList>
                                            {filteredItems.map(item => (
                                                <CommandItem
                                                    key={item.id}
                                                    onSelect={() => {
                                                        const newSelectedIds = [
                                                            ...selectedIds,
                                                            item.id,
                                                        ];
                                                        setSelectedIds(
                                                            newSelectedIds
                                                        );
                                                        field.onChange(
                                                            newSelectedIds
                                                        );
                                                        setInputValue('');
                                                    }}
                                                >
                                                    {renderItem
                                                        ? renderItem(item)
                                                        : defaultRenderItem(
                                                              item
                                                          )}
                                                </CommandItem>
                                            ))}
                                            {showCreateOption && (
                                                <CommandItem
                                                    key="create-new-item"
                                                    onSelect={() => {
                                                        const newValue =
                                                            inputValue.trim();
                                                        onCreateItem?.(
                                                            newValue
                                                        );
                                                        const newSelectedIds = [
                                                            ...selectedIds,
                                                            newValue,
                                                        ];
                                                        setSelectedIds(
                                                            newSelectedIds
                                                        );
                                                        field.onChange(
                                                            newSelectedIds
                                                        );
                                                        setInputValue('');
                                                    }}
                                                >
                                                    <div className="flex items-center">
                                                        <span>
                                                            Create &quot;
                                                            {inputValue.trim()}
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
