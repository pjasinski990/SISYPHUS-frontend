import { Task, TaskCategory, TaskSize } from '../../service/taskService';
import React, { forwardRef } from 'react';
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

export interface TaskFormData {
    title: string;
    description: string;
    category: TaskCategory;
    size: TaskSize;
    listName: string;
    startTime: string;
    duration: string;
}

interface TaskFormProps {
    initialData?: Task;
    listName: string;
    onSubmit: (task: TaskFormData) => void;
    onCancel: () => void;
}

export const TaskForm = forwardRef<HTMLFormElement, TaskFormProps>(
    ({ initialData, listName, onSubmit, onCancel }, ref) => {
        const {
            register,
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
                      startTime: initialData.startTime,
                  }
                : {
                      title: '',
                      description: '',
                      category: TaskCategory.WHITE,
                      size: TaskSize.SMALL,
                      duration: '',
                      startTime: '',
                  },
        });

        const onFormSubmit = (data: TaskFormData) => {
            data.listName = listName;
            onSubmit(data);
        };

        const handleKeyDown = (event: React.KeyboardEvent) => {
            if (event.key === 'Enter' && event.ctrlKey) {
                event.preventDefault();
            } else if (event.key === 'Enter') {
                event.stopPropagation();
            }
        };

        return (
            <form
                ref={ref}
                onSubmit={handleSubmit(onFormSubmit)}
                className="space-y-6"
            >
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
                                    onKeyDown={handleKeyDown}
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
                                placeholder="Task Description"
                                onKeyDown={handleKeyDown}
                            />
                        )}
                    />
                </div>

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
                                    onKeyDown={handleKeyDown}
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
                                    onKeyDown={handleKeyDown}
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

                <div>
                    <label
                        htmlFor="startTime"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Start Time
                    </label>
                    <Input
                        id="startTime"
                        {...register('startTime')}
                        placeholder="Start Time"
                        type="time"
                    />
                </div>

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
