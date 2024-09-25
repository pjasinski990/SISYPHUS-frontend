import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "src/components/ui/card";
import { Task } from "../../service/taskService";
import { TaskItem } from "src/components/task/TaskItem";
import { TaskFormData } from "src/components/task/TaskForm";
import { TaskDialog } from "src/components/task/TaskDialog";
import { ConfirmDialog } from "src/components/library/ConfirmDialog";
import { TaskPropertiesProvider } from "src/components/context/TaskPropertiesContext";
import { useDailyPlan } from "src/components/context/DailyPlanContext";
import { Shortcut } from "src/components/context/ShortcutsContext";
import { useRegisterShortcut } from "src/components/context/RegisterShortcutContext";
import { TaskList } from "src/components/task_list/TaskList";
import { TaskExtensionProvider } from "src/components/context/TaskExtensionContext";
import { ArrowRight } from "lucide-react";
import { useTaskInteraction } from "src/components/context/TaskInteractionContext";

export const ReusableTaskPicker: React.FC = () => {
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
    const [removingTask, setRemovingTask] = useState<Task | null>(null);
    const addTaskToDailyPlan = useDailyPlan().onAddTask;

    const { tasks, onCreateTask, onEditTask, onRemoveTask } = useTaskInteraction()

    const cardContentRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (cardContentRef.current) {
            cardContentRef.current.scrollTo({
                left: 0,
                behavior: 'smooth',
            });
        }
    }, [tasks]);

    const handleCreateTask = useCallback(() => {
        setIsCreateTaskDialogOpen(true);
    }, []);

    const handleTaskFormSubmit = useCallback(
        async (taskData: TaskFormData) => {
            if (editingTask) {
                await onEditTask(editingTask.id!, taskData);
                setEditingTask(null);
            } else {
                onCreateTask(taskData);
                setIsCreateTaskDialogOpen(false);
            }
        },
        [editingTask, onCreateTask, onEditTask]
    );

    const handleTaskFormCancel = useCallback(() => {
        setIsCreateTaskDialogOpen(false);
        setEditingTask(null);
    }, []);

    const handleConfirmRemoveTask = useCallback(async () => {
        if (removingTask) {
            await onRemoveTask(removingTask.id!);
            setRemovingTask(null);
        }
    }, [onRemoveTask, removingTask]);

    const handleCancelRemoveTask = useCallback(() => {
        setRemovingTask(null);
    }, []);

    const addTaskShortcut: Shortcut = useMemo(
        () => ({
            id: 'add-task-reusable',
            keys: ['A'],
            action: handleCreateTask,
            description: 'Add a new task to reusable tasks',
            order: 1,
        }),
        [handleCreateTask]
    );

    useRegisterShortcut(addTaskShortcut);

    return (
        <Card className="flex flex-col min-h-[calc(100vh-150px)]">
            <TaskDialog
                open={isCreateTaskDialogOpen || !!editingTask}
                listName={'REUSABLE'}
                initialData={editingTask}
                onSubmit={handleTaskFormSubmit}
                onCancel={handleTaskFormCancel}
                title={`${editingTask ? 'Edit reusable task' : 'Create reusable task'}`}
            />

            <ConfirmDialog
                open={!!removingTask}
                title="Confirmation"
                message="Remove this task from reusable tasks?"
                onConfirm={handleConfirmRemoveTask}
                onCancel={handleCancelRemoveTask}
            >
                {removingTask && <TaskItem task={removingTask} isVanity={true}/>}
            </ConfirmDialog>

            <CardContent
                ref={cardContentRef}
                className="flex-grow h-full overflow-y-auto overflow-x-clip scrollbar-custom"
            >
                <TaskPropertiesProvider onTaskEdit={setEditingTask} onTaskRemove={setRemovingTask} isDraggable={false} isFoldable={true}>
                    <TaskExtensionProvider extraButtons={[{icon: ArrowRight, handler: addTaskToDailyPlan}]}>
                        <div className={'mt-6'}>
                            <TaskList
                                tasks={tasks}
                                placeholderNode={
                                    <>
                                        <span>reusable tasks.</span>
                                        <span>the building blocks of your monotone life.</span>
                                    </>
                                }
                                title={'Reusable tasks'}
                                isDroppable={false}
                                showCreateButton={true}
                                onCreateTask={handleCreateTask}
                            />
                        </div>
                    </TaskExtensionProvider>
                </TaskPropertiesProvider>
            </CardContent>
        </Card>
    );
};
