import { Task, TaskCategory, TaskSize } from "../../service/taskService";
import React, { forwardRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { Input } from "src/components/ui/input";
import { Textarea } from "src/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "src/components/ui/select";
import { Checkbox } from "src/components/ui/checkbox";
import { Button } from "src/components/ui/button";

export interface TaskFormData {
    title: string;
    description: string;
    category: TaskCategory;
    size: TaskSize;
    startTime: string;
    reusable: boolean;
}

interface TaskFormProps {
    initialData?: Task;
    onSubmit: (task: TaskFormData) => void;
    onCancel: () => void;
    hideReusableState?: boolean;
}

export const TaskForm = forwardRef<HTMLFormElement, TaskFormProps>(({
                                                                        initialData,
                                                                        onSubmit,
                                                                        onCancel,
                                                                        hideReusableState = false
                                                                    }, ref) => {
    const { register, handleSubmit, control, formState: { errors } } = useForm<TaskFormData>({
        defaultValues: initialData ? {
            title: initialData.title,
            description: initialData.description,
            category: initialData.category,
            size: initialData.size,
            startTime: initialData.startTime,
            reusable: initialData.reusable,
        } : {
            title: '',
            description: '',
            category: TaskCategory.WHITE,
            size: TaskSize.SMALL,
            startTime: '',
            reusable: false,
        }
    });

    const onFormSubmit = (data: TaskFormData) => {
        onSubmit(data);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && event.shiftKey) {
            event.stopPropagation();
        } else if (event.key === 'Enter') {
            event.preventDefault();
        }
    };

    return (
        <form ref={ref} onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                </label>
                <Input
                    id="title"
                    {...register("title", { required: "Title is required" })}
                    placeholder="Task Title"
                    onKeyDown={handleKeyDown}
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                </label>
                <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Task Description"
                    onKeyDown={handleKeyDown}
                />
            </div>

            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                </label>
                <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger id="category" onKeyDown={handleKeyDown}>
                                <SelectValue placeholder="Select category">{field.value}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(TaskCategory).map((value) => (
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
                <label htmlFor="size" className="block text-sm font-medium text-gray-700">
                    Size
                </label>
                <Controller
                    name="size"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger id="size" onKeyDown={handleKeyDown}>
                                <SelectValue placeholder="Select size">{field.value}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(TaskSize).map((value) => (
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
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                    Start Time
                </label>
                <Input
                    id="startTime"
                    {...register("startTime")}
                    placeholder="Start Time"
                    type="time"
                />
            </div>

            {hideReusableState ||
                <>
                    <div className="flex items-center">
                        <Controller
                            name="reusable"
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    id="reusable"
                                    className="w-6 h-6 ml-1"
                                />
                            )}
                        />
                        <label htmlFor="reusable" className="ml-2 block text-sm text-gray-700">
                            Keep in reusable tasks
                        </label>
                    </div>
                </>
            }

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">Save</Button>
            </div>
        </form>
    );
});
