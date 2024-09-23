import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { DailyPlanContent } from "src/components/daily_plan/DailyPlanContent";
import { useDailyPlan } from "src/components/context/DailyPlanContext";

export const DailyPlanDashboard: React.FC = () => {
    const { dailyPlan } = useDailyPlan()

    return dailyPlan ? (
        <Card>
            <CardHeader>
                <CardTitle className="text-gray-800 dark:text-gray-200 text-center">Today</CardTitle>
            </CardHeader>
            <CardContent>
                <DailyPlanContent dailyPlan={dailyPlan}/>
            </CardContent>
        </Card>
    ) : (
        <Card>
            <CardHeader>
                Loading Daily Plan...
            </CardHeader>
        </Card>
    );
};
