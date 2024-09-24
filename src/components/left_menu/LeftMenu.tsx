import { Tabs, TabsContent, TabsList, TabsTrigger } from "src/components/ui/tabs";
import { ReusableTasksProvider } from "src/components/context/ReusableTasksContext";
import { ReusableTaskPicker } from "src/components/left_menu/ReusableTaskPicker";
import Inbox from "src/components/left_menu/Inbox";
import React from "react";

export const LeftMenu: React.FC = () => {
    return (
        <Tabs defaultValue="reusableTasks" className="h-full flex flex-col">
            <TabsList className="rounded-none flex justify-start items-stretch p-0 bg-white dark:bg-slate-950 h-10">
                <TabsTrigger
                    value="reusableTasks"
                    className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-none data-[state=inactive]:bg-slate-100 dark:data-[state=inactive]:bg-slate-800"
                >
                    Reusable Tasks
                </TabsTrigger>
                <TabsTrigger
                    value="inbox"
                    className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-none data-[state=inactive]:bg-slate-100 dark:data-[state=inactive]:bg-slate-800"
                >
                    Inbox
                </TabsTrigger>
            </TabsList>
            <TabsContent value="reusableTasks" className="flex-grow overflow-auto">
                <ReusableTasksProvider>
                    <ReusableTaskPicker/>
                </ReusableTasksProvider>
            </TabsContent>
            <TabsContent value="inbox" className="flex-grow overflow-auto">
                <Inbox />
            </TabsContent>
        </Tabs>
    );
}