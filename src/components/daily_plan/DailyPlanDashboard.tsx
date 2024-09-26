import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { DailyPlanContent } from "src/components/daily_plan/DailyPlanContent";
import { LoadingPlaceholder } from "src/components/library/LoadingPlaceholder";

export const DailyPlanDashboard: React.FC = () => {
    const showDailyPlan = true;
    return showDailyPlan ? (
        <Card>
            <CardHeader>
                <CardTitle className="text-gray-800 dark:text-gray-200 text-center">Today</CardTitle>
            </CardHeader>
            <CardContent>
                <DailyPlanContent />
            </CardContent>
        </Card>
    ) : (
        <Card>
            <CardHeader>
                <LoadingPlaceholder />
            </CardHeader>
        </Card>
    );
};
