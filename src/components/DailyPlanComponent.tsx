import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { DailyPlan } from "../service/dailyPlanService";
import { ExtendableTaskList, TaskList } from "./TaskListComponent";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "src/components/ui/dialog";
import { Textarea } from "src/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "src/components/ui/select";
import { Task, TaskCategory, TaskSize } from "../service/taskService";

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
}

const TaskForm: React.FC<TaskFormProps> = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<TaskFormData>(initialData || {
        title: '',
        description: '',
        category: TaskCategory.WHITE,
        size: TaskSize.SMALL,
        startTime: '',
        reusable: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string) => (value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Task Title"
                required
            />
            <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Task Description"
            />
            <Select name="category" onValueChange={handleSelectChange("category")} defaultValue={formData.category.toString()}>
                <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(TaskCategory).filter(([key]) => isNaN(Number(key))).map(([key, value]) => (
                        <SelectItem key={key} value={value.toString()}>{key}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select name="size" onValueChange={handleSelectChange("size")} defaultValue={formData.size.toString()}>
                <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(TaskSize).filter(([key]) => isNaN(Number(key))).map(([key, value]) => (
                        <SelectItem key={key} value={value.toString()}>{key}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Input
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                placeholder="Start Time"
                type="time"
            />
            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="reusable"
                    name="reusable"
                    checked={formData.reusable}
                    onChange={(e) => setFormData(prev => ({ ...prev, reusable: e.target.checked }))}
                />
                <label htmlFor="reusable">Reusable</label>
            </div>
            <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save</Button>
            </div>
        </form>
    );
};

interface DailyPlanContentProps {
    dailyPlan: DailyPlan | null;
    onTaskMove: (result: DropResult) => void;
    onAddTask: (task: TaskFormData) => void;
    onEditTask: (taskId: string, updatedTask: TaskFormData) => void;
}

const DailyPlanContent: React.FC<DailyPlanContentProps> = ({
                                                               dailyPlan,
                                                               onTaskMove,
                                                               onAddTask,
                                                               onEditTask
                                                           }) => {
    const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const handleDragEnd = (result: DropResult) => {
        onTaskMove(result);
    };

    const handleAddTask = () => {
        setIsAddTaskDialogOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
    };

    const handleTaskFormSubmit = (taskData: TaskFormData) => {
        if (editingTask) {
            onEditTask(editingTask.id!!, taskData);
            setEditingTask(null);
        } else {
            onAddTask(taskData);
            setIsAddTaskDialogOpen(false);
        }
    };

    const handleTaskFormCancel = () => {
        setIsAddTaskDialogOpen(false);
        setEditingTask(null);
    };

    return (
        dailyPlan? <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4">
                <div className="flex-1">
                    <ExtendableTaskList
                        title="To Do"
                        tasks={dailyPlan.todo}
                        droppableId="todo"
                        showAddButton={true}
                        onAddTask={handleAddTask}
                        onEditTask={handleEditTask}
                    />
                </div>
                <div className="flex-1">
                    <TaskList
                        title="Done"
                        tasks={dailyPlan.done}
                        droppableId="done"
                        onEditTask={handleEditTask}
                    />
                </div>
            </div>

            <Dialog open={isAddTaskDialogOpen || !!editingTask} onOpenChange={handleTaskFormCancel}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
                    </DialogHeader>
                    <TaskForm
                        initialData={editingTask || undefined}
                        onSubmit={handleTaskFormSubmit}
                        onCancel={handleTaskFormCancel}
                    />
                </DialogContent>
            </Dialog>
        </DragDropContext> : <span>Loading Daily Plan...</span>
    );
};

export const DailyPlanComponent: React.FC<DailyPlanContentProps> = ({
                                                                        dailyPlan,
                                                                        onTaskMove,
                                                                        onAddTask,
                                                                        onEditTask
                                                                    }) => {
    return dailyPlan ? (
        <Card className="w-full max-w-5xl bg-white dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="text-gray-800 dark:text-gray-200">{dailyPlan.day}</CardTitle>
            </CardHeader>
            <CardContent>
                <DailyPlanContent
                    dailyPlan={dailyPlan}
                    onTaskMove={onTaskMove}
                    onAddTask={onAddTask}
                    onEditTask={onEditTask}
                />
            </CardContent>
        </Card>
    ) : null;
};
