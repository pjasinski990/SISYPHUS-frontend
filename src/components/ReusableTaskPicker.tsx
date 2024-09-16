import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { Task } from "../service/taskService";
import { TaskItem } from "src/components/task/TaskItem";
import { PlusButton } from "src/components/library/PlusButton";
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
        <Card>
            <TaskDialog
                open={!!editingTask}
                initialData={editingTask}
                hideReusableState={true}
                onSubmit={handleTaskFormSubmit}
                onCancel={() => {setEditingTask(null);}}
                title={'Edit Task'}
            />

            <ConfirmDialog
                open={!!removingTask}
                title="Confirmation"
                message="Remove this task from reusable tasks?"
                onConfirm={handleConfirmRemoveTask}
                onCancel={() => {setRemovingTask(null);}}
            >
                {removingTask && (
                    <TaskItem task={removingTask} isVanity={true}/>
                )}
            </ConfirmDialog>

            <CardHeader>
                <CardTitle>Reusable Tasks</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {tasks.map((task) => (
                        <li key={task.id} className="flex items-center justify-between p-2">
                            <TaskPropertiesProvider
                                onTaskEdit={() => setEditingTask(task)}
                                onTaskRemove={() => setRemovingTask(task)}
                                isDraggable={false}
                                isFoldable={true}
                            >
                                <TaskItem task={task}/>
                                <PlusButton label={""} onClick={() => onAddToTodo(task)}/>
                            </TaskPropertiesProvider>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
};
