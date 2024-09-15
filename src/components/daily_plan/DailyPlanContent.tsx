import React, { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { ExtendableTaskList, TaskList } from "src/components/task_list/TaskList";
import { TaskItem } from "src/components/task/TaskItem";
import { DailyPlan } from "../../service/dailyPlanService";
import { TaskFormData } from "src/components/library/TaskForm";
import { Task } from "../../service/taskService";
import { TaskDialog } from "src/components/library/TaskDialog";
import { ConfirmDialog } from "src/components/task/ConfirmDialog";

interface DailyPlanContentProps {
    dailyPlan: DailyPlan;
    onTaskMove: (result: DropResult) => void;
    onAddTask: (task: TaskFormData) => void;
    onEditTask: (taskId: string, updatedTask: TaskFormData) => void;
    onRemoveTask: (taskId: string) => void;
}

export const DailyPlanContent: React.FC<DailyPlanContentProps> = ({
                                                                      dailyPlan,
                                                                      onTaskMove,
                                                                      onAddTask,
                                                                      onEditTask,
                                                                      onRemoveTask,
                                                                  }) => {
    const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [removingTask, setRemovingTask] = useState<Task | null>(null);

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
    };

    const handleConfirmRemoveTask = () => {
        if (removingTask) {
            onRemoveTask(removingTask.id!);
            setRemovingTask(null);
        }
    };

    const handleCancelRemoveTask = () => {
        setRemovingTask(null);
    };

    const handleTaskFormSubmit = (taskData: TaskFormData) => {
        if (editingTask) {
            onEditTask(editingTask.id!, taskData);
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
        <DragDropContext onDragEnd={handleDragEnd}>
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

            <TaskDialog
                open={isAddTaskDialogOpen || !!editingTask}
                initialData={editingTask}
                hideReusableState={!!editingTask}
                onSubmit={handleTaskFormSubmit}
                onCancel={handleTaskFormCancel}
                title={editingTask ? 'Edit Task' : 'Add New Task'}
            />

            <ConfirmDialog
                open={!!removingTask}
                title="Confirmation"
                message="Remove this task from today's schedule?"
                onConfirm={handleConfirmRemoveTask}
                onCancel={handleCancelRemoveTask}
            >
                {removingTask && (
                    <TaskItem task={removingTask} onRemoveTask={() => {}} onEditTask={() => {}}/>
                )}
            </ConfirmDialog>
        </DragDropContext>
    );
};
