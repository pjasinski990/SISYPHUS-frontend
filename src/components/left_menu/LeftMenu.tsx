import { Tabs, TabsContent, TabsList, TabsTrigger } from "src/components/ui/tabs";
import { ReusableTasksProvider } from "src/components/context/ReusableTasksContext";
import { ReusableTaskPicker } from "src/components/left_menu/ReusableTaskPicker";
import Inbox from "src/components/left_menu/Inbox";
import React from "react";

export const LeftMenu: React.FC = () => {
    return (
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
    );
}
