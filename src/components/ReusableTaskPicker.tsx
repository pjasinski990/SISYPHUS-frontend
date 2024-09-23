import React, { useContext, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { Task } from "../service/taskService";
import { TaskItem } from "src/components/task/TaskItem";
import { ArrowRightButton } from "src/components/library/Buttons";
import { TaskFormData } from "src/components/task/TaskForm";
import { TaskDialog } from "src/components/task/TaskDialog";
import { ConfirmDialog } from "src/components/library/ConfirmDialog";
import { TaskPropertiesProvider } from "src/components/context/TaskPropertiesContext";
import { useDailyPlan } from "src/components/context/DailyPlanContext";
import { useReusableTasks } from "src/components/context/ReusableTasksContext";

export const ReusableTaskPicker: React.FC = () => {
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [removingTask, setRemovingTask] = useState<Task | null>(null);
    const addTaskToDailyPlan = useDailyPlan().onAddTask;

    const rtContext = useReusableTasks()
    const tasks = rtContext.reusableTasks
    const { onCreateTask, onEditTask, onRemoveTask } = rtContext

    const cardContentRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (cardContentRef.current) {
            cardContentRef.current.scrollTo({
                left: 0,
                behavior: 'smooth'
            });
        }
    }, [tasks]);

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
        <Card className="flex flex-col min-h-[calc(100vh-100px)] min-w-[400px]">
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
                {removingTask && <TaskItem task={removingTask} isVanity={true}/>}
            </ConfirmDialog>

            <CardHeader>
                <CardTitle>Reusable Tasks</CardTitle>
            </CardHeader>
            <CardContent
                ref={cardContentRef}
                className="flex-grow max-h-[calc(100vh-200px)] overflow-auto scrollbar-custom"

            >
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