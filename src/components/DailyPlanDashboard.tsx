import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { DailyPlan } from "../service/dailyPlanService";
import { DropResult } from "@hello-pangea/dnd";
import { TaskFormData } from "src/components/task/TaskForm";
import { DailyPlanContent } from "src/components/daily_plan/DailyPlanContent";

interface DailyPlanDashboardProps {
    dailyPlan: DailyPlan | null;
    onTaskMove: (result: DropResult) => void;
    onAddTask: (task: TaskFormData) => void;
    onEditTask: (taskId: string, updatedTask: TaskFormData) => void;
    onRemoveTask: (taskId: string) => void;
}

export const DailyPlanDashboard: React.FC<DailyPlanDashboardProps> = ({
                                                                          dailyPlan,
                                                                          onTaskMove,
                                                                          onAddTask,
                                                                          onEditTask,
                                                                          onRemoveTask,
                                                                      }) => {
    return dailyPlan ? (
        <Card>
            <CardHeader>
                <CardTitle className="text-gray-800 dark:text-gray-200">{dailyPlan.day}</CardTitle>
            </CardHeader>
            <CardContent>
                <DailyPlanContent
                    dailyPlan={dailyPlan}
                    onTaskMove={onTaskMove}
                    onAddTask={onAddTask}
                    onEditTask={onEditTask}
                    onRemoveTask={onRemoveTask}
                />
            </CardContent>
        </Card>
    ) : (
        <span>Loading Daily Plan...</span>
    );
};
