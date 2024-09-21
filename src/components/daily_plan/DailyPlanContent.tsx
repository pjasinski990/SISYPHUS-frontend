import React, { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { TaskList } from "src/components/task_list/TaskList";
import { TaskItem } from "src/components/task/TaskItem";
import { DailyPlan } from "../../service/dailyPlanService";
import { TaskFormData } from "src/components/task/TaskForm";
import { Task } from "../../service/taskService";
import { TaskDialog } from "src/components/task/TaskDialog";
import { ConfirmDialog } from "src/components/library/ConfirmDialog";
import { TaskPropertiesProvider } from "src/components/context/TaskPropertiesContext";

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
                <TaskPropertiesProvider onTaskEdit={handleEditTask} onTaskRemove={handleRemoveTask} isDraggable={true} isFoldable={true}>
                    <TaskList
                        title="To Do"
                        tasks={dailyPlan.todo}
                        droppableId="todo"
                        showAddButton={true}
                        onAddTask={handleAddTask}
                    />
                </TaskPropertiesProvider>
                <TaskPropertiesProvider onTaskEdit={handleEditTask} onTaskRemove={handleRemoveTask} isDraggable={true} isFoldable={true}>
                    <TaskList
                        title="Done"
                        tasks={dailyPlan.done}
                        droppableId="done"
                    />
                </TaskPropertiesProvider>
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
                    <TaskItem task={removingTask} isVanity={true}/>
                )}
            </ConfirmDialog>
        </DragDropContext>
    );
};
