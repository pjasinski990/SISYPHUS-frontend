import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { DailyPlan } from "../service/dailyPlanService";
import { ExtendableTaskList, TaskList } from "./TaskListComponent";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "src/components/ui/dialog";
import { Task } from "../service/taskService";
import { TaskForm, TaskFormData } from "src/components/TaskForm";


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
