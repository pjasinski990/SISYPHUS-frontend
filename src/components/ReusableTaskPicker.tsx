import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import React from "react";
import { Task } from "../service/taskService";
import { TaskItem } from "src/components/task/TaskItem";
import { PlusButton } from "src/components/library/PlusButton";

export interface ReusableTaskPickerProps {
    tasks: Task[]
    handleAddToTodo: (task: Task) => void
}

export const ReusableTaskPicker = (props: ReusableTaskPickerProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Reusable Tasks</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {props.tasks.map((task) => (
                        <li key={task.id} className="flex items-center justify-between p-2">
                            <TaskItem key={task.id} task={task} onEditTask={() => {}} onRemoveTask={() => {}} />
                            <PlusButton label={""} onClick={() => props.handleAddToTodo(task)}/>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    )
}
