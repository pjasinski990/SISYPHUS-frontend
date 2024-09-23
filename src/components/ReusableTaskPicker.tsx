import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { Task } from "../service/taskService";
import { TaskItem } from "src/components/task/TaskItem";
import { ArrowRightButton, PlusButton } from "src/components/library/Buttons";
import { TaskFormData } from "src/components/task/TaskForm";
import { TaskDialog } from "src/components/task/TaskDialog";
import { ConfirmDialog } from "src/components/library/ConfirmDialog";
import { TaskPropertiesProvider } from "src/components/context/TaskPropertiesContext";
import { useDailyPlan } from "src/components/context/DailyPlanContext";
import { useReusableTasks } from "src/components/context/ReusableTasksContext";
import { Shortcut } from "src/components/context/ShortcutsContext";
import { useRegisterShortcut } from "src/components/context/RegisterShortcutContext";

export const ReusableTaskPicker: React.FC = () => {
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
    const [removingTask, setRemovingTask] = useState<Task | null>(null);
    const addTaskToDailyPlan = useDailyPlan().onAddTask;

    const rtContext = useReusableTasks();
    const tasks = rtContext.reusableTasks;
    const { onCreateTask, onEditTask, onRemoveTask } = rtContext;

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
            keys: ['Shift', 'C'],
            action: handleCreateTask,
            description: 'Add a new task to reusable tasks',
            order: 1,
        }),
        [handleCreateTask]
    );

    useRegisterShortcut(addTaskShortcut);

    return (
        <Card className="flex flex-col min-h-[calc(100vh-100px)] min-w-[400px]">
            <TaskDialog
                open={isCreateTaskDialogOpen || !!editingTask}
                initialData={editingTask}
                hideReusableState={true}
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

            <CardHeader className={'flex-row justify-between items-baseline'}>
                <CardTitle>Reusable Tasks</CardTitle>
                <PlusButton onClick={handleCreateTask} label={'Create'}/>
            </CardHeader>
            <CardContent
                ref={cardContentRef}
                className="flex-grow max-h-[calc(100vh-200px)] overflow-y-auto overflow-x-clip scrollbar-custom"
            >
                <ul className="space-y-1 ">
                    {tasks.map((task) => (
                        <li key={task.id}>
                            <div className="flex items-center content-between">
                                <TaskPropertiesProvider
                                    onTaskEdit={() => setEditingTask(task)}
                                    onTaskRemove={() => setRemovingTask(task)}
                                    isDraggable={false}
                                    isFoldable={true}
                                >
                                    <TaskItem task={task} className="flex-grow mr-2" />
                                </TaskPropertiesProvider>
                                <ArrowRightButton
                                    label=""
                                    onClick={() => addTaskToDailyPlan(task)}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
};
