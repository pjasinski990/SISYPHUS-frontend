import React, { forwardRef, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select';
import { Button } from 'src/components/ui/button';
import { EmojiInput } from 'src/components/library/EmojiInput';
import { Input } from 'src/components/ui/input';
import { Slider } from 'src/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover';
import { Command, CommandInput, CommandItem, CommandList } from 'src/components/ui/command';
import { Badge } from 'src/components/ui/badge';
import { Task, TaskCategory, TaskSize } from '../../../service/taskService';
import { extractHoursFromIsoTime, extractMinutesFromIsoTime } from '../../../lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'src/components/ui/tooltip';
import { EmojiTextareaWithPreview } from '../../library/EmojiTextAreaWithPreview';
import { buildTaskFormTextCommands } from './taskFormTextCommands';

export interface TaskFormData {
    title: string;
    category: TaskCategory;
    size: TaskSize;
    listName: string;
    description: string | null;
    startTime: string | null;
    duration: string | null;
    deadline: string | null;
    dependencies: string[] | null;
    flexibility: number | null;
    durationHours: number | null;
    durationMinutes: number | null;
    hasDeadline: boolean;
    tags: string[] | null;
}

interface TaskFormProps {
    initialData?: Task;
    listName: string;
    onSubmit: (task: TaskFormData) => void;
    onCancel: () => void;
    availableTasks: Task[];
}

export const TaskForm = forwardRef<HTMLFormElement, TaskFormProps>(
    ({ initialData, listName, onSubmit, onCancel, availableTasks }, ref) => {
        const {
            control,
            handleSubmit,
            watch,
            formState: { errors },
            setValue,
        } = useForm<TaskFormData>({
            defaultValues: initialData
                ? {
                      title: initialData.title,
                      description: initialData.description,
                      category: initialData.category,
                      size: initialData.size,
                      listName: initialData.listName,
                      duration: initialData.duration,
                      durationHours: extractHoursFromIsoTime(
                          initialData.duration
                      ),
                      durationMinutes: extractMinutesFromIsoTime(
                          initialData.duration
                      ),
                      startTime: initialData.startTime,
                      deadline: initialData.deadline,
                      dependencies: initialData.dependencies || [],
                      flexibility: initialData.flexibility ?? 0.1,
                      hasDeadline: !!initialData.deadline,
                      tags: initialData.tags || [],
                  }
                : {
                      title: '',
                      description: '',
                      category: TaskCategory.WHITE,
                      size: TaskSize.SMALL,
                      duration: null,
                      startTime: '',
                      deadline: null,
                      dependencies: [],
                      flexibility: 0.1,
                      durationHours: null,
                      durationMinutes: null,
                      hasDeadline: false,
                      tags: [],
                  },
        });
        const [selectedDependencies, setSelectedDependencies] = useState<
            string[]
        >(initialData?.dependencies || []);
        const [selectedTags, setSelectedTags] = useState<string[]>(
            initialData?.tags || []
        );

        const [tagInputValue, setTagInputValue] = useState('');
        const [dependencyInputValue, setDependencyInputValue] = useState('');

        const taskFormTextCommands = buildTaskFormTextCommands(setValue)

        useEffect(() => {
            if (initialData?.dependencies) {
                setSelectedDependencies(initialData.dependencies);
            }
            if (initialData?.tags) {
                setSelectedTags(initialData.tags);
            }
        }, [initialData]);

        const existingTags = React.useMemo(() => {
            const tagCounts = new Map<string, number>();
            for (const task of availableTasks) {
                if (task.tags) {
                    for (const tag of task.tags) {
                        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
                    }
                }
            }
            return tagCounts;
        }, [availableTasks]);

        const getFlexibilityMessage = (value: number) => {
            if (value === 0) {
                return "Task is fixed and won't be rescheduled.";
            } else if (value === 1) {
                return 'Task can be rescheduled freely or moved to next days.';
            } else {
                const maxRescheduleMinutes = value * 8 * 60;
                return `Task can be rescheduled up to ${Math.round(
                    maxRescheduleMinutes
                )} minutes.`;
            }
        };

        const onFormSubmit = (data: TaskFormData) => {
            data.listName = listName;

            const hours = data.durationHours || 0;
            const minutes = data.durationMinutes || 0;

            if (hours || minutes) {
                const durationParts = [
                    hours ? `${hours}H` : '',
                    minutes ? `${minutes}M` : '',
                ].join('');
                data.duration = `PT${durationParts}`;
            } else {
                data.duration = null;
            }

            if (!data.hasDeadline) {
                data.deadline = null;
            }

            onSubmit(data);
        };

        const handleKeyDown = (event: React.KeyboardEvent) => {
            if (event.key === 'Enter') {
                if (event.ctrlKey) {
                    return;
                }

                const target = event.target as HTMLElement;
                const tagName = target.tagName.toLowerCase();

                if (tagName === 'button') {
                    return;
                }

                if (tagName === 'textarea' || target.isContentEditable) {
                    event.stopPropagation();
                    return;
                }

                event.preventDefault();
                event.stopPropagation();
            }
        };

        const preventActionWhenCtrlPressed = (event: React.KeyboardEvent) => {
            if (event.ctrlKey) {
                event.preventDefault();
            }
        };

        const hasDeadline = watch('hasDeadline');

        return (
            <form
                ref={ref}
                onKeyDown={handleKeyDown}
                onSubmit={handleSubmit(onFormSubmit)}
                className="space-y-6"
            >
                {/* Title Field */}
                <div>
                    <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Title
                    </label>
                    <Controller
                        name="title"
                        control={control}
                        rules={{ required: 'Title is required' }}
                        render={({ field }) => (
                            <>
                                <EmojiInput
                                    id="title"
                                    {...field}
                                    placeholder="Task Title"
                                    autoComplete="off"
                                    textCommands={taskFormTextCommands}
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.title.message}
                                    </p>
                                )}
                            </>
                        )}
                    />
                </div>

                {/* Description Field */}
                <div>
                    <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Description
                    </label>
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <EmojiTextareaWithPreview
                                value={field.value ?? ''}
                                onChange={field.onChange}
                                placeholder="Task Description"
                                textCommands={taskFormTextCommands}
                            />
                        )}
                    />
                </div>

                {/* Category Field */}
                <div>
                    <label
                        htmlFor="category"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Category
                    </label>
                    <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                            <Select
                                onValueChange={field.onChange}
                                value={field.value}
                            >
                                <SelectTrigger
                                    id={'category'}
                                    onKeyDown={preventActionWhenCtrlPressed}
                                >
                                    <SelectValue placeholder="Select category">
                                        {field.value}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(TaskCategory).map(value => (
                                        <SelectItem key={value} value={value}>
                                            {value}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                {/* Size Field */}
                <div>
                    <label
                        htmlFor="size"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Size
                    </label>
                    <Controller
                        name="size"
                        control={control}
                        render={({ field }) => (
                            <Select
                                onValueChange={field.onChange}
                                value={field.value}
                            >
                                <SelectTrigger
                                    id={'size'}
                                    onKeyDown={preventActionWhenCtrlPressed}
                                >
                                    <SelectValue placeholder="Select size">
                                        {field.value}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(TaskSize).map(value => (
                                        <SelectItem key={value} value={value}>
                                            {value}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                {/* Duration Field */}
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
                                                    : parseInt(
                                                          e.target.value,
                                                          10
                                                      );
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
                                                    : parseInt(
                                                          e.target.value,
                                                          10
                                                      );
                                            field.onChange(value);
                                        }}
                                    />
                                )}
                            />
                        </div>
                    </fieldset>
                </div>

                {/* Start Time Field */}
                <div>
                    <label
                        htmlFor="startTime"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Start Time
                    </label>
                    <Controller
                        name="startTime"
                        control={control}
                        render={({ field }) => (
                            <Input
                                id="startTime"
                                type="time"
                                {...field}
                                value={field.value ?? ''}
                                placeholder="Start Time"
                            />
                        )}
                    />
                </div>

                {/* Has Deadline Checkbox */}
                <div className="flex items-center">
                    <Controller
                        name="hasDeadline"
                        control={control}
                        render={({ field }) => (
                            <input
                                type="checkbox"
                                id="hasDeadline"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                        )}
                    />
                    <label
                        htmlFor="hasDeadline"
                        className="pl-2 block text-sm font-medium text-gray-700"
                    >
                        Has Deadline
                    </label>
                </div>

                {/* Deadline Field */}
                <div className="relative">
                    <label
                        htmlFor="deadline"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Deadline
                    </label>
                    <Controller
                        name="deadline"
                        control={control}
                        rules={{
                            required: hasDeadline
                                ? 'Deadline is required'
                                : false,
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
                                                value={field.value ?? ''}
                                                placeholder="Select deadline"
                                                disabled={!hasDeadline}
                                            />
                                        </div>
                                    </TooltipTrigger>
                                    {!hasDeadline && (
                                        <TooltipContent>
                                            Enable &quot;Has Deadline&quot; to
                                            set a deadline.
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

                {/* Tags Field */}
                <div>
                    <label
                        htmlFor="tags"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Tags
                    </label>
                    <Controller
                        name="tags"
                        control={control}
                        render={({ field }) => {
                            const filteredTags = Array.from(
                                existingTags.entries()
                            ).filter(
                                ([tag]) =>
                                    !selectedTags.includes(tag) &&
                                    tag
                                        .toLowerCase()
                                        .includes(tagInputValue.toLowerCase())
                            );

                            const showCreateOption =
                                tagInputValue.trim() !== '' &&
                                !existingTags.has(tagInputValue.trim()) &&
                                !selectedTags.includes(tagInputValue.trim());

                            return (
                                <div>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                data-testid="tags-button"
                                                className="w-full p-2 border rounded cursor-pointer flex flex-wrap gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                aria-haspopup="dialog"
                                                aria-expanded={
                                                    selectedTags.length > 0
                                                }
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
                                                                        t =>
                                                                            t !==
                                                                            tag
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
                                                    onValueChange={
                                                        setTagInputValue
                                                    }
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
                                                                setTagInputValue(
                                                                    ''
                                                                );
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
                                                                    <span>
                                                                        {tag}
                                                                    </span>
                                                                    <span className="text-gray-500 text-sm">
                                                                        {count}{' '}
                                                                        task
                                                                        {count >
                                                                        1
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
                                                                setTagInputValue(
                                                                    ''
                                                                );
                                                            }}
                                                        >
                                                            <div className="flex items-center">
                                                                <span>
                                                                    Create
                                                                    &quot;
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

                {/* Dependencies Field */}
                <div>
                    <label
                        htmlFor="dependencies"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Dependencies
                    </label>
                    <Controller
                        name="dependencies"
                        control={control}
                        render={({ field }) => (
                            <div>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button
                                            type="button"
                                            data-testid="dependencies-button"
                                            className="w-full p-2 border rounded cursor-pointer flex flex-wrap gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            aria-haspopup="dialog"
                                            aria-expanded={
                                                selectedDependencies.length > 0
                                            }
                                        >
                                            {selectedDependencies.length > 0 ? (
                                                selectedDependencies.map(id => {
                                                    const task =
                                                        availableTasks.find(
                                                            t => t.id === id
                                                        );
                                                    return (
                                                        <Badge
                                                            key={id}
                                                            className="mr-1 cursor-pointer"
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                const newSelectedDependencies =
                                                                    selectedDependencies.filter(
                                                                        depId =>
                                                                            depId !==
                                                                            id
                                                                    );
                                                                setSelectedDependencies(
                                                                    newSelectedDependencies
                                                                );
                                                                field.onChange(
                                                                    newSelectedDependencies
                                                                );
                                                            }}
                                                        >
                                                            {task?.title || id}
                                                            <span className="ml-1">
                                                                ✕
                                                            </span>
                                                        </Badge>
                                                    );
                                                })
                                            ) : (
                                                <span className="text-gray-500">
                                                    Select dependencies
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
                                                placeholder="Search tasks..."
                                                aria-label="Search tasks"
                                                value={dependencyInputValue}
                                                onValueChange={
                                                    setDependencyInputValue
                                                }
                                            />
                                            <CommandList>
                                                {availableTasks
                                                    .filter(task =>
                                                        task.title
                                                            .toLowerCase()
                                                            .includes(
                                                                dependencyInputValue.toLowerCase()
                                                            )
                                                    )
                                                    .map(task => {
                                                        if (!task.id)
                                                            return null;
                                                        const taskId = task.id;
                                                        const isSelected =
                                                            selectedDependencies.includes(
                                                                taskId
                                                            );
                                                        return (
                                                            <CommandItem
                                                                key={taskId}
                                                                onSelect={() => {
                                                                    let newValue: string[];
                                                                    if (
                                                                        isSelected
                                                                    ) {
                                                                        newValue =
                                                                            selectedDependencies.filter(
                                                                                id =>
                                                                                    id !==
                                                                                    taskId
                                                                            );
                                                                    } else {
                                                                        newValue =
                                                                            [
                                                                                ...selectedDependencies,
                                                                                taskId,
                                                                            ];
                                                                    }
                                                                    setSelectedDependencies(
                                                                        newValue
                                                                    );
                                                                    field.onChange(
                                                                        newValue
                                                                    );
                                                                }}
                                                            >
                                                                <div className="flex items-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={
                                                                            isSelected
                                                                        }
                                                                        readOnly
                                                                        className="mr-2"
                                                                        aria-label={
                                                                            isSelected
                                                                                ? `Deselect ${task.title}`
                                                                                : `Select ${task.title}`
                                                                        }
                                                                    />
                                                                    {task.title}
                                                                </div>
                                                            </CommandItem>
                                                        );
                                                    })}
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        )}
                    />
                </div>

                {/* Flexibility Field */}
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
                                        onValueChange={value =>
                                            field.onChange(value[0])
                                        }
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

                {/* Form Actions */}
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        );
    }
);

TaskForm.displayName = 'TaskForm';
