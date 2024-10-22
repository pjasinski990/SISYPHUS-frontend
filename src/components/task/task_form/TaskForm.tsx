import React, { forwardRef, useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button } from 'src/components/ui/button';
import { EmojiInput } from 'src/components/library/EmojiInput';
import { EmojiTextareaWithPreview } from '../../library/EmojiTextAreaWithPreview';
import { Task, TaskCategory, TaskSize } from '../../../service/taskService';
import { buildTaskFormTextCommands } from './taskFormTextCommands';
import { TextInputField } from './fields/TextInputField';
import { SelectField } from './fields/SelectField';
import { CheckboxField } from './fields/CheckboxField';
import { DurationField } from './fields/DurationField';
import { TagsInput } from './fields/TagsInput';
import { DependenciesInput } from './fields/DependenciesInput';
import { FlexibilitySlider } from './fields/FlexibilitySlider';
import { DeadlineField } from './fields/DeadlineField';
import { TaskFormData } from './taskFormData';

interface TaskFormProps {
    initialTask: Task | null;
    listName: string;
    onSubmit: (task: TaskFormData) => void;
    onCancel: () => void;
    availableTasks: Task[];
}

export const TaskForm = forwardRef<HTMLFormElement, TaskFormProps>(
    ({ initialTask, listName, onSubmit, onCancel, availableTasks }, ref) => {
        const {
            control,
            handleSubmit,
            watch,
            formState: { errors },
            setValue,
            getValues,
        } = useForm<TaskFormData>({
            defaultValues: initialTask
                ? TaskFormData.fromTask(initialTask)
                : new TaskFormData({}),
        });
        const hasDeadline = watch('hasDeadline');

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

        const taskFormTextCommands = buildTaskFormTextCommands(
            getValues,
            setValue,
            [...existingTags.keys()],
        );

        const prepareFormForSubmission = useCallback(
            (data: TaskFormData) => {
                data.listName = listName;
                data.duration = buildDurationFromInputs(
                    data.durationHours,
                    data.durationMinutes
                );
                data.deadline = data.hasDeadline ? data.deadline : null;

                return data;
            },
            [listName]
        );

        const onFormSubmit = useCallback(
            (data: TaskFormData) => {
                const readyData = prepareFormForSubmission(data);
                onSubmit(readyData);
            },
            [onSubmit, prepareFormForSubmission]
        );

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
                <DeadlineField
                    name={'deadline'}
                    control={control}
                    label={'Deadline'}
                    enabled={hasDeadline}
                    errors={errors}
                />

                {/* Tags Field */}
                <TagsInput
                    name="tags"
                    control={control}
                    label="Tags"
                    availableTags={existingTags}
                    initialTags={initialTask?.tags || []}
                />

                {/* Dependencies Field */}
                <DependenciesInput
                    name="dependencies"
                    control={control}
                    label="Dependencies"
                    availableTasks={availableTasks}
                    initialDependencies={initialTask?.dependencies || []}
                />

                {/* Flexibility Field */}
                <FlexibilitySlider control={control} />

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

const buildDurationFromInputs = (
    hours: number | null,
    minutes: number | null
): string | null => {
    const h = hours || 0;
    const m = minutes || 0;

    if (h || m) {
        const durationParts = [h ? `${h}H` : '', m ? `${m}M` : ''].join('');
        return `PT${durationParts}`;
    } else {
        return null;
    }
};
