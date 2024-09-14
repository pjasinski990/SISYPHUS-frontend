import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { DailyPlan } from "../service/dailyPlanService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "src/components/ui/dialog";
import { Button } from "src/components/ui/button";
import { Task } from "../service/taskService";
import { TaskForm, TaskFormData } from "src/components/task/TaskForm";
import { ExtendableTaskList, TaskList } from "src/components/task_list/TaskList";
import { TaskItem } from "src/components/task/TaskItem";


interface DailyPlanContentProps {
    dailyPlan: DailyPlan | null;
    onTaskMove: (result: DropResult) => void;
    onAddTask: (task: TaskFormData) => void;
    onEditTask: (taskId: string, updatedTask: TaskFormData) => void;
    onRemoveTask: (taskId: string) => void;
}

const DailyPlanContent: React.FC<DailyPlanContentProps> = ({
                                                               dailyPlan,
                                                               onTaskMove,
                                                               onAddTask,
                                                               onEditTask,
                                                               onRemoveTask,
                                                           }) => {
    const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [removingTask, setRemovingTask] = useState<Task | null>(null);
    const [isRemoveConfirmationOpen, setIsRemoveConfirmationOpen] = useState(false);

    const handleDragEnd = (result: DropResult) => {
        onTaskMove(result);
    };

    const handleAddTask = () => {
        setIsAddTaskDialogOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
    };

    const handleRemoveTask = (task: Task) => {
        setRemovingTask(task);
        setIsRemoveConfirmationOpen(true);
    };

    const handleConfirmRemoveTask = () => {
        if (removingTask) {
            onRemoveTask(removingTask.id!!);
            setRemovingTask(null);
        }
        setIsRemoveConfirmationOpen(false);
    };

    const handleCancelRemoveTask = () => {
        setIsRemoveConfirmationOpen(false);
        setRemovingTask(null);
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
        dailyPlan ? <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4">
                <div className="flex-1">
                    <ExtendableTaskList
                        title="To Do"
                        tasks={dailyPlan.todo}
                        droppableId="todo"
                        showAddButton={true}
                        onAddTask={handleAddTask}
                        onEditTask={handleEditTask}
                        onRemoveTask={handleRemoveTask}
                    />
                </div>
                <div className="flex-1">
                    <TaskList
                        title="Done"
                        tasks={dailyPlan.done}
                        droppableId="done"
                        onEditTask={handleEditTask}
                        onRemoveTask={handleRemoveTask}
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

            <Dialog open={isRemoveConfirmationOpen} onOpenChange={handleCancelRemoveTask}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmation</DialogTitle>
                    </DialogHeader>
                    <div>
                        <p className="mb-4">Remove this task from today's schedule?</p>
                        {removingTask && (
                            <TaskItem task={removingTask} onRemoveTask={() => {}} onEditTask={() => {}}/>
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCancelRemoveTask}>Cancel</Button>
                        <Button variant="destructive" onClick={handleConfirmRemoveTask}>Remove</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DragDropContext> : <span>Loading Daily Plan...</span>
    );
};

export const DailyPlanDashboard: React.FC<DailyPlanContentProps> = ({
                                                                        dailyPlan,
                                                                        onTaskMove,
                                                                        onAddTask,
                                                                        onEditTask,
                                                                        onRemoveTask,
                                                                    }) => {
    return dailyPlan ? (
        <Card>
            <CardHeader>
                <CardTitle className="text-gray-800 dark:text-gray-200">{dailyPlan.day}</CardTitle>
            </CardHeader>
            <CardContent>
                <DailyPlanContent
                    dailyPlan={dailyPlan}
                    onTaskMove={onTaskMove}
                    onAddTask={onAddTask}
                    onEditTask={onEditTask}
                    onRemoveTask={onRemoveTask}
                />
            </CardContent>
        </Card>
    ) : null;
};
