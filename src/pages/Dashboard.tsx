import React, { useState } from 'react';
import Layout from "src/components/Layout";
import { DailyPlanDashboard } from "src/components/DailyPlanDashboard";
import { ReusableTaskPicker } from "src/components/ReusableTaskPicker";
import { SlidingPanel } from "src/components/library/SlidingPanel";
import { ChevronRight } from "lucide-react";
import { DailyPlanProvider } from "src/components/context/DailyPlanContext";
import { ReusableTasksProvider } from "src/components/context/ReusableTasksContext";

const Dashboard: React.FC = () => {
    const [isTaskPickerOpen, setIsTaskPickerOpen] = useState(true);

    const toggleTaskPicker = () => {
        setIsTaskPickerOpen(!isTaskPickerOpen);
    };

    const shortcuts = {

    }

    return (
        <Layout>
            <div>
                <div className="flex h-full">
                    <DailyPlanProvider>
                        <SlidingPanel
                            isOpen={isTaskPickerOpen}
                            setIsOpen={toggleTaskPicker}
                            maxWidth={400}
                        >
                            <ReusableTasksProvider>
                                <ReusableTaskPicker/>
                            </ReusableTasksProvider>
                        </SlidingPanel>
                        <div className={`flex flex-1 transition-all duration-200`}>
                            <div
                                onClick={() => toggleTaskPicker()}
                                className={`h-full w-8 bg-white hover:bg-slate-50 dark:bg-slate-950 hover:dark:bg-slate-900 flex items-center justify-center cursor-pointer ${isTaskPickerOpen ? 'mr-[20px] ml-[1px]' : 'mr-[1px]'}`}
                            >
                                <ChevronRight
                                    size={24}
                                    className={`text-slate-500 transition-transform duration-200 ${
                                        isTaskPickerOpen ? 'rotate-0' : 'rotate-180'
                                    }`}
                                />
                            </div>
                            <DailyPlanDashboard />
                        </div>
                    </DailyPlanProvider>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
