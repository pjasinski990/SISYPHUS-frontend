import React, { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { TaskList } from "src/components/task_list/TaskList";
import { TaskItem } from "src/components/task/TaskItem";
import { TaskFormData } from "src/components/task/TaskForm";
import { Task } from "../../service/taskService";
import { TaskDialog } from "src/components/task/TaskDialog";
import { ConfirmDialog } from "src/components/library/ConfirmDialog";
import { TaskPropertiesProvider } from "src/components/context/TaskPropertiesContext";
import { useDailyPlan } from "src/components/context/DailyPlanContext";
import { DailyPlan } from "../../service/dailyPlanService";
import KeyboardShortcutHandler from "src/components/keyboard/KeyboardShortcutHandler";
import { useRegisterShortcut } from "src/components/context/RegisterShortcutContext";
import { Shortcut } from "src/components/context/ShortcutsContext";

export const DailyPlanContent: React.FC<{dailyPlan: DailyPlan}> = ({ dailyPlan }) => {
    const [isAddTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [removingTask, setRemovingTask] = useState<Task | null>(null);

    const { onDragEnd , onCreateTask, onEditTask, onRemoveTask } = useDailyPlan()

    const handleDragEnd = async (result: DropResult) => {
        await onDragEnd(result);
    };

    const handleCreateTask = () => {
        setIsCreateTaskDialogOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
    };

    const handleRemoveTask = (task: Task) => {
        setRemovingTask(task);
    };

    const handleConfirmRemoveTask = async () => {
        if (removingTask) {
            await onRemoveTask(removingTask.id!);
            setRemovingTask(null);
        }
    };

    const handleCancelRemoveTask = () => {
        setRemovingTask(null);
    };

    const handleTaskFormSubmit = async (taskData: TaskFormData) => {
        if (editingTask) {
            await onEditTask(editingTask.id!, taskData);
            setEditingTask(null);
        } else {
            onCreateTask(taskData);
            setIsCreateTaskDialogOpen(false);
        }
    };

    const handleTaskFormCancel = () => {
        setIsCreateTaskDialogOpen(false);
        setEditingTask(null);
    };

    const addTaskShortcut: Shortcut = {
        id: 'add-task-daily-plan',
        keys: ['Ctrl', 'M'],
        action: handleCreateTask,
        description: 'add a new task to today\'s todo list',
        order: 1,
    };

    useRegisterShortcut(addTaskShortcut);

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4">
                <TaskPropertiesProvider onTaskEdit={handleEditTask} onTaskRemove={handleRemoveTask} isDraggable={true} isFoldable={true}>
                    <TaskList
                        title="To Do"
                        tasks={dailyPlan.todo}
                        droppableId="todo"
                        placeholderText={'empty. well done!'}
                        showCreateButton={true}
                        onCreateTask={handleCreateTask}
                    />
                </TaskPropertiesProvider>
                <TaskPropertiesProvider onTaskEdit={handleEditTask} onTaskRemove={handleRemoveTask} isDraggable={true} isFoldable={true}>
                    <TaskList
                        title="Done"
                        tasks={dailyPlan.done}
                        droppableId="done"
                        placeholderText={'drag your done tasks here'}
                    />
                </TaskPropertiesProvider>
            </div>

            <TaskDialog
                open={isAddTaskDialogOpen || !!editingTask}
                initialData={editingTask}
                hideReusableState={true}
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
