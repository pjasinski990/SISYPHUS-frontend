import React, { useCallback, useMemo, useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { TaskList } from "src/components/task_list/TaskList";
import { TaskItem } from "src/components/task/TaskItem";
import { TaskFormData } from "src/components/task/TaskForm";
import { Task } from "../../service/taskService";
import { TaskDialog } from "src/components/task/TaskDialog";
import { ConfirmDialog } from "src/components/library/ConfirmDialog";
import { TaskPropertiesProvider } from "src/components/context/TaskPropertiesContext";
import { useRegisterShortcut } from "src/components/context/RegisterShortcutContext";
import { Shortcut } from "src/components/context/ShortcutsContext";
import { TaskInteractionProvider } from "src/components/context/TaskInteractionContext";
import { useTaskLists } from "src/components/context/TaskListsContext";

export const DailyPlanContent: React.FC = () => {
    const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [removingTask, setRemovingTask] = useState<Task | null>(null);

    const todoContext = useTaskLists('DAILY_TODO')
    const doneContext = useTaskLists('DAILY_DONE')

    const handleDragEnd = useCallback(async (result: DropResult) => {
        // await onDragEnd(result);
    }, []);

    const handleCreateTask = useCallback(() => {
        setIsCreateTaskDialogOpen(true);
    }, []);

    const handleEditTask = useCallback((task: Task) => {
        setEditingTask(task);
    }, []);

    const handleRemoveTask = useCallback((task: Task) => {
        setRemovingTask(task);
    }, []);

    const handleTaskFormSubmit = useCallback(async (taskData: TaskFormData) => {
        // if (editingTask) {
        //     await onEditTask(editingTask.id!, taskData);
        //     setEditingTask(null);
        // } else {
        //     onCreateTask(taskData);
        //     setIsCreateTaskDialogOpen(false);
        // }
    }, []);

    const handleTaskFormCancel = useCallback(() => {
        setIsCreateTaskDialogOpen(false);
        setEditingTask(null);
    }, []);

    const handleConfirmRemoveTask = useCallback(async () => {
        // if (removingTask) {
        //     await onRemoveTask(removingTask.id!);
        //     setRemovingTask(null);
        // }
    }, []);

    const handleCancelRemoveTask = useCallback(() => {
        setRemovingTask(null);
    }, []);

    const addTaskShortcut: Shortcut = useMemo(() => ({
        id: 'add-task-daily-plan',
        keys: ['C'],
        action: handleCreateTask,
        description: 'Add a new task to today\'s todo list',
        order: 1,
    }), [handleCreateTask]);

    useRegisterShortcut(addTaskShortcut);

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4">
                <TaskInteractionProvider listName={'DAILY_TODO'} tasks={todoContext.tasks} setTasks={todoContext.setTasks}>
                    <TaskPropertiesProvider isDraggable={true} isFoldable={true}>
                        <TaskList
                            title="Todo"
                            tasks={todoContext.tasks}
                            droppableId="todo"
                            placeholderNode={<span>empty. well done!</span>}
                            showCreateButton={true}
                            onCreateTask={handleCreateTask}
                        />
                    </TaskPropertiesProvider>
                </TaskInteractionProvider>
                <TaskPropertiesProvider isDraggable={true} isFoldable={true}>
                    <TaskList
                        title="Done"
                        tasks={doneContext.tasks}
                        droppableId="done"
                        placeholderNode={<span>drop your done tasks here.</span>}
                    />
                </TaskPropertiesProvider>
            </div>

            <TaskDialog
                open={isCreateTaskDialogOpen || !!editingTask}
                listName={'DAILY_TODO'}
                initialData={editingTask}
                onSubmit={handleTaskFormSubmit}
                onCancel={handleTaskFormCancel}
                title={editingTask ? 'Edit task' : 'Create task'}
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
