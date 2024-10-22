import React, { forwardRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button } from 'src/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from 'src/components/ui/tooltip';
import { EmojiInput } from 'src/components/library/EmojiInput';
import { EmojiTextareaWithPreview } from '../../library/EmojiTextAreaWithPreview';
import { Task, TaskCategory, TaskSize } from '../../../service/taskService';
import {
    extractHoursFromIsoTime,
    extractMinutesFromIsoTime,
} from '../../../lib/utils';
import { buildTaskFormTextCommands } from './taskFormTextCommands';
import { TextInputField } from './fields/TextInputField';
import { SelectField } from './fields/SelectField';
import { CheckboxField } from './fields/CheckboxField';
import { DurationField } from './fields/DurationField';
import { TagsInput } from './fields/TagsInput';
import { DependenciesInput } from './fields/DependenciesInput';
import { FlexibilitySlider } from './fields/FlexibilitySlider';

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
            getValues,
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

        const taskFormTextCommands = buildTaskFormTextCommands(
            getValues,
            setValue
        );

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
                return `Task can be rescheduled up to ${Math.round(maxRescheduleMinutes)} minutes.`;
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
                <SelectField
                    name="category"
                    control={control}
                    label="Category"
                    options={Object.values(TaskCategory).map(value => ({
                        value,
                        label: value,
                    }))}
                    placeholder="Select category"
                />

                {/* Size Field */}
                <SelectField
                    name="size"
                    control={control}
                    label="Size"
                    options={Object.values(TaskSize).map(value => ({
                        value,
                        label: value,
                    }))}
                    placeholder="Select size"
                />

                {/* Duration Field */}
                <DurationField control={control} />

                {/* Start Time Field */}
                <TextInputField
                    name="startTime"
                    control={control}
                    label="Start Time"
                    placeholder="Start Time"
                    type="time"
                />

                {/* Has Deadline Checkbox */}
                <CheckboxField
                    name="hasDeadline"
                    control={control}
                    label="Has Deadline"
                />

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
                                            <input
                                                {...field}
                                                id="deadline"
                                                name="deadline"
                                                type="datetime-local"
                                                value={field.value ?? ''}
                                                placeholder="Select deadline"
                                                disabled={!hasDeadline}
                                                className="input-class-name"
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
                <TagsInput
                    name="tags"
                    control={control}
                    label="Tags"
                    availableTags={existingTags}
                    initialTags={initialData?.tags || []}
                />

                {/* Dependencies Field */}
                <DependenciesInput
                    name="dependencies"
                    control={control}
                    label="Dependencies"
                    availableTasks={availableTasks}
                    initialDependencies={initialData?.dependencies || []}
                />

                {/* Flexibility Field */}
                <FlexibilitySlider
                    control={control}
                    getFlexibilityMessage={getFlexibilityMessage}
                />

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
