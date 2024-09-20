import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { Task } from "../service/taskService";
import { TaskItem } from "src/components/task/TaskItem";
import { ArrowRightButton } from "src/components/library/Buttons";
import { TaskFormData } from "src/components/task/TaskForm";
import { TaskDialog } from "src/components/task/TaskDialog";
import { ConfirmDialog } from "src/components/library/ConfirmDialog";
import { TaskPropertiesProvider } from "src/components/context/TaskPropertiesContext";

interface ReusableTaskPickerProps {
    tasks: Task[];
    onAddToTodo: (task: Task) => void;
    onEditTask: (taskId: string, updatedTask: TaskFormData) => void;
    onRemoveTask: (taskId: string) => void;
}

export const ReusableTaskPicker: React.FC<ReusableTaskPickerProps> = ({
                                                                          tasks,
                                                                          onAddToTodo,
                                                                          onEditTask,
                                                                          onRemoveTask,
                                                                      }) => {
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [removingTask, setRemovingTask] = useState<Task | null>(null);

    const handleTaskFormSubmit = (taskData: TaskFormData) => {
        if (editingTask) {
            onEditTask(editingTask.id!, taskData);
            setEditingTask(null);
        }
    };

    const handleConfirmRemoveTask = () => {
        if (removingTask) {
            onRemoveTask(removingTask.id!);
            setRemovingTask(null);
        }
    };

    return (
        <Card className="flex flex-col overflow-auto h-[80vh] min-h-[200px]">
            <TaskDialog
                open={!!editingTask}
                initialData={editingTask}
                hideReusableState={true}
                onSubmit={handleTaskFormSubmit}
                onCancel={() => {
                    setEditingTask(null);
                }}
                title={"Edit Task"}
            />

            <ConfirmDialog
                open={!!removingTask}
                title="Confirmation"
                message="Remove this task from reusable tasks?"
                onConfirm={handleConfirmRemoveTask}
                onCancel={() => {
                    setRemovingTask(null);
                }}
            >
                {removingTask && <TaskItem task={removingTask} isVanity={true} />}
            </ConfirmDialog>

            <CardHeader>
                <CardTitle>Reusable Tasks</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-auto">
                <ul className="space-y-1">
                    {tasks.map((task) => (
                        <li key={task.id}>
                            <div className="flex items-center content-between">
                                <TaskPropertiesProvider
                                    onTaskEdit={() => setEditingTask(task)}
                                    onTaskRemove={() => setRemovingTask(task)}
                                    isDraggable={false}
                                    isFoldable={true}
                                >
                                    <TaskItem task={task} className={"flex-grow mr-2"}/>
                                </TaskPropertiesProvider>
                                <ArrowRightButton
                                    label=""
                                    onClick={() => onAddToTodo(task)}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
};
