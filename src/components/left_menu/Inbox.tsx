import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Task } from "../../service/taskService";
import { TaskFormData } from "src/components/task/TaskForm";
import { Shortcut } from "src/components/context/ShortcutsContext";
import { useRegisterShortcut } from "src/components/context/RegisterShortcutContext";
import { Card, CardContent } from "src/components/ui/card";
import { TaskDialog } from "src/components/task/TaskDialog";
import { ConfirmDialog } from "src/components/library/ConfirmDialog";
import { TaskItem } from "src/components/task/TaskItem";
import { TaskPropertiesProvider } from "src/components/context/TaskPropertiesContext";
import { TaskList } from "src/components/task_list/TaskList";
import { useInbox } from "src/components/context/InboxContext";

export const Inbox: React.FC = () => {
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
    const [removingTask, setRemovingTask] = useState<Task | null>(null);

    const inboxContext = useInbox();
    const tasks = inboxContext.inboxTasks;
    const { onCreateTask, onEditTask, onRemoveTask } = inboxContext;

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
            id: 'add-task-inbox',
            keys: ['A'],
            action: handleCreateTask,
            description: 'Add a new task to inbox',
            order: 1,
        }),
        [handleCreateTask]
    );

    useRegisterShortcut(addTaskShortcut);

    return (
        <Card className="flex flex-col min-h-[calc(100vh-150px)]">
            <TaskDialog
                open={isCreateTaskDialogOpen || !!editingTask}
                initialData={editingTask}
                hideReusableState={true}
                onSubmit={handleTaskFormSubmit}
                onCancel={handleTaskFormCancel}
                title={`${editingTask ? 'Edit inbox task' : 'Create inbox task'}`}
            />

            <ConfirmDialog
                open={!!removingTask}
                title="Confirmation"
                message="Remove this task from inbox?"
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
                    <div className={'mt-6'}>
                        <TaskList
                            tasks={tasks}
                            placeholderNode={
                                <>
                                    <span>inbox.</span>
                                    <span>throw all of your concerns inside.</span>
                                </>
                            }
                            title={'Inbox'}
                            isDroppable={false}
                            showCreateButton={true}
                            onCreateTask={handleCreateTask}
                        />
                    </div>
                </TaskPropertiesProvider>
            </CardContent>
        </Card>
    );
};
