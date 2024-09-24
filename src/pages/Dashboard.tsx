// Dashboard.tsx
import React, { useCallback, useMemo, useState } from 'react';
import Layout from "src/components/Layout";
import { DailyPlanDashboard } from "src/components/DailyPlanDashboard";
import { ReusableTaskPicker } from "src/components/ReusableTaskPicker";
import { SlidingPanel } from "src/components/library/SlidingPanel";
import { ChevronRight } from "lucide-react";
import { DailyPlanProvider } from "src/components/context/DailyPlanContext";
import { ReusableTasksProvider } from "src/components/context/ReusableTasksContext";
import { useRegisterShortcut } from "src/components/context/RegisterShortcutContext";
import { Shortcut } from "src/components/context/ShortcutsContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "src/components/ui/tabs";
import Inbox from "src/components/Inbox";

const Dashboard: React.FC = () => {
    const [isTaskPickerOpen, setIsTaskPickerOpen] = useState(true);

    const toggleTaskPicker = useCallback(() => {
        setIsTaskPickerOpen(!isTaskPickerOpen);
    }, [isTaskPickerOpen]);

    const toggleTaskPickerShortcut: Shortcut = useMemo(() => ({
        id: 'toggle-reusable-tasks-picker',
        keys: ['Shift', 'R'],
        action: toggleTaskPicker,
        description: 'Toggle reusable tasks picker',
        order: 2,
    }), [toggleTaskPicker]);

    useRegisterShortcut(toggleTaskPickerShortcut);

    return (
        <Layout>
            <div className="flex h-full">
                <DailyPlanProvider>
                    <SlidingPanel
                        isOpen={isTaskPickerOpen}
                        setIsOpen={toggleTaskPicker}
                        maxWidth={400}
                    >
                        <Tabs defaultValue="reusableTasks" className="h-full flex flex-col">
                            <TabsList>
                                <TabsTrigger value="reusableTasks">Reusable Tasks</TabsTrigger>
                                <TabsTrigger value="inbox">Inbox</TabsTrigger>
                            </TabsList>
                            <TabsContent value="reusableTasks" className="flex-grow">
                                <ReusableTasksProvider>
                                    <ReusableTaskPicker/>
                                </ReusableTasksProvider>
                            </TabsContent>
                            <TabsContent value="inbox" className="flex-grow">
                                <Inbox />
                            </TabsContent>
                        </Tabs>
                    </SlidingPanel>
                    <div className={`flex flex-1 transition-all duration-200`}>
                        <div
                            onClick={toggleTaskPicker}
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
        </Layout>
    );
};

export default Dashboard;
