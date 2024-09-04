import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { Button } from "src/components/ui/button";
import { Task } from "../service/taskService";
import { DragDropContext, Droppable, Draggable, DropResult, DragUpdate, DragStart } from '@hello-pangea/dnd';
import { DailyPlan } from "../service/dailyPlanService";

interface TaskListProps {
    title: string;
    tasks: Task[];
    droppableId: string;
}

interface DailyPlanContentProps {
    dailyPlan: DailyPlan;
    onTaskMove: (result: DropResult) => void;
}

interface DailyPlanComponentProps {
    dailyPlan: DailyPlan | null;
    onLogout: () => void;
    onTaskMove: (result: DropResult) => void;
}


const TaskList: React.FC<TaskListProps> = ({ title, tasks, droppableId }) => {
    return (
        <Droppable droppableId={droppableId}>
            {(provided, snapshot) => {
                return (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`bg-gray-100 dark:bg-gray-800 p-4 rounded-lg min-h-[200px] ${
                            snapshot.isDraggingOver ? 'bg-blue-100 dark:bg-blue-900' : ''
                        }`}
                    >
                        <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">{title}</h3>
                        {tasks.map((task, index) => {
                            const taskId = String(task.id);
                            return (
                                <Draggable key={taskId} draggableId={taskId} index={index}>
                                    {(provided, snapshot) => {
                                        return (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`bg-white dark:bg-gray-700 p-2 mb-2 rounded shadow text-gray-800 dark:text-gray-200 ${
                                                    snapshot.isDragging ? 'opacity-50' : ''
                                                }`}
                                            >
                                                <div {...provided.dragHandleProps}>
                                                    <h4 className="font-semibold">{task.title}</h4>
                                                </div>
                                                <p className="text-sm">{task.description}</p>
                                                <div className="text-xs mt-1">
                                                    <span className="mr-2">Category: {task.category}</span>
                                                    <span className="mr-2">Size: {task.size}</span>
                                                    <span>Start: {task.startTime}</span>
                                                </div>
                                            </div>
                                        );
                                    }}
                                </Draggable>                            );
                        })}
                        {provided.placeholder}
                    </div>
                );
            }}
        </Droppable>
    );
};
const DailyPlanContent: React.FC<DailyPlanContentProps> = ({ dailyPlan, onTaskMove }) => {
    if (!dailyPlan) return <p className="text-gray-800 dark:text-gray-200">Loading daily plan...</p>;

    const handleDragEnd = (result: DropResult) => {
        onTaskMove(result);
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4">
                <div className="flex-1">
                    <TaskList title="To Do" tasks={dailyPlan.todo} droppableId="todo" />
                </div>
                <div className="flex-1">
                    <TaskList title="Done" tasks={dailyPlan.done} droppableId="done" />
                </div>
            </div>
        </DragDropContext>
    );
};

export const DailyPlanComponent: React.FC<DailyPlanComponentProps> = ({ dailyPlan, onLogout, onTaskMove }) => {
    return dailyPlan ? (
        <Card className="w-full max-w-5xl bg-white dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="text-gray-800 dark:text-gray-200">{dailyPlan.day}</CardTitle>
            </CardHeader>
            <CardContent>
                <DailyPlanContent dailyPlan={dailyPlan} onTaskMove={onTaskMove} />
            </CardContent>
        </Card>
    ) : null;
};
