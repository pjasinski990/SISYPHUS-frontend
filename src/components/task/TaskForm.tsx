import React, { forwardRef, useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from 'src/components/ui/select';
import { Button } from 'src/components/ui/button';
import { EmojiInput } from 'src/components/library/EmojiInput';
import { EmojiTextarea } from 'src/components/library/EmojiTextArea';
import { Input } from 'src/components/ui/input';
import { Slider } from 'src/components/ui/slider';
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from 'src/components/ui/popover';
import {
    Command,
    CommandInput,
    CommandList,
    CommandItem,
} from 'src/components/ui/command';
import { Badge } from 'src/components/ui/badge';
import { Task, TaskCategory, TaskSize } from '../../service/taskService';
import {
    extractHoursFromIsoTime,
    extractMinutesFromIsoTime,
} from '../../lib/utils';

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
            formState: { errors },
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
                  },
        });

        const [selectedDependencies, setSelectedDependencies] = useState<
            string[]
        >(initialData?.dependencies || []);

        useEffect(() => {
            if (initialData?.dependencies) {
                setSelectedDependencies(initialData.dependencies);
            }
        }, [initialData]);

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

            onSubmit(data);
        };

        const handleKeyDown = (event: React.KeyboardEvent) => {
            if (event.key === 'Enter') {
                if (event.ctrlKey) {
                    return;
                }

                const target = event.target as HTMLElement;
                const tagName = target.tagName.toLowerCase();
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
                            <EmojiTextarea
                                id="description"
                                {...field}
                                value={field.value ?? ''}
                                placeholder="Task Description"
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
                                    id="category"
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
                                    id="size"
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

                {/* Duration Field */}
                <div>
                    <label
                        htmlFor="duration"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Duration
                    </label>
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
                                    value={field.value ?? undefined}
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
                                    value={field.value ?? undefined}
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
                </div>

                {/* Deadline Field */}
                <div>
                    <label
                        htmlFor="deadline"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Deadline
                    </label>
                    <Controller
                        name="deadline"
                        control={control}
                        render={({ field }) => (
                            <Input
                                id="deadline"
                                type="datetime-local"
                                {...field}
                                value={field.value ?? ''}
                                placeholder="Select deadline"
                            />
                        )}
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
                                                            className="mr-1"
                                                        >
                                                            {task?.title || id}
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
                                    >
                                        <Command>
                                            <CommandInput
                                                placeholder="Search tasks..."
                                                aria-label="Search tasks"
                                            />
                                            <CommandList>
                                                {availableTasks.map(task => {
                                                    if (!task.id) return null;
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
                                                                    newValue = [
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
