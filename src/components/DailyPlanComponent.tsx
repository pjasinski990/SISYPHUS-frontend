import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { Button } from "src/components/ui/button";
import { Task } from "../service/taskService";

interface DailyPlanProps {
    dailyPlan: {
        id: string;
        ownerUsername: string;
        day: string;
        todo: Task[];
        done: Task[];
    } | null;
    onLogout: () => void;
}

export const TaskList: React.FC<{ title: string; tasks: Task[] }> = ({ title, tasks }) => (
    <div className="mb-4">
        <h3 className="text-lg font-semibold">{title}:</h3>
        <ul>
            {tasks.map((task) => (
                <li key={task.id} className="mb-2">
                    <span className="font-medium">{task.description}</span> -
                    {task.startTime} ({task.category}, {task.size})
                </li>
            ))}
        </ul>
    </div>
);

export const DailyPlanContent: React.FC<{ dailyPlan: DailyPlanProps['dailyPlan'] }> = ({ dailyPlan }) => {
    if (!dailyPlan) return <p>Loading daily plan...</p>;

    return (
        <div>
            <TaskList title="To Do" tasks={dailyPlan.todo} />
            <TaskList title="Done" tasks={dailyPlan.done} />
        </div>
    );
};

export const DailyPlanComponent: React.FC<DailyPlanProps> = ({ dailyPlan, onLogout }) => {
    return (
        dailyPlan?
            <Card className="w-full max-w-3xl">
                <CardHeader>
                    <CardTitle>{dailyPlan.day}</CardTitle>
                </CardHeader>
                <CardContent>
                    <DailyPlanContent dailyPlan={dailyPlan} />
                    <Button onClick={onLogout} className="w-full mt-4">
                        Logout
                    </Button>
                </CardContent>
            </Card>
            : null
    );
};
