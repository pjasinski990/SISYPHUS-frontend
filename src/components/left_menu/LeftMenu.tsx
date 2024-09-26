import React, { useEffect, useMemo, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "src/components/ui/tabs";
import { ReusableTaskPicker } from "src/components/left_menu/ReusableTaskPicker";
import { motion } from "framer-motion";
import { Inbox } from "src/components/left_menu/Inbox";
import { TaskInteractionProvider } from "src/components/context/TaskInteractionContext";
import { useTaskLists } from "src/components/context/TaskListsContext";

export type TabValue = 'inbox' | 'reusableTasks';

interface LeftMenuProps {
    activeTab: TabValue;
    onActiveTabChange: (tab: TabValue) => void;
}

export const LeftMenu: React.FC<LeftMenuProps> = ({ activeTab, onActiveTabChange }) => {
    const [direction, setDirection] = useState(0);
    const prevTabRef = useRef<TabValue>("inbox");

    const inboxContext = useTaskLists('INBOX')
    const reusableContext = useTaskLists('REUSABLE')

    const tabOrder: Record<TabValue, number> = useMemo(() => ({
        inbox: 0,
        reusableTasks: 1,
    }), []);

    useEffect(() => {
        const prevIndex = tabOrder[prevTabRef.current];
        const newIndex = tabOrder[activeTab];

        if (newIndex > prevIndex) {
            setDirection(-1);
        } else if (newIndex < prevIndex) {
            setDirection(1);
        } else {
            setDirection(0);
        }

        prevTabRef.current = activeTab;
    }, [activeTab, tabOrder]);

    const handleTabChange = (value: string) => {
        if (!(value in tabOrder)) {
            console.warn(`Unknown tab value: ${value}`);
            return;
        }

        const castedValue = value as TabValue;
        onActiveTabChange(castedValue);
    };

    const variants = {
        hidden: (direction: number) => ({
            opacity: 0,
            x: direction > 0 ? 200 : -200,
        }),
        visible: {
            opacity: 1,
            x: 0,
        },
    };

    return (
        <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="h-full flex flex-col"
        >
            <TabsList className="rounded-none flex justify-start items-stretch p-0 bg-white dark:bg-slate-950 h-10">
                <TabsTrigger
                    value="inbox"
                    className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-none data-[state=inactive]:bg-slate-100 dark:data-[state=inactive]:bg-slate-800"
                >
                    Inbox
                </TabsTrigger>
                <TabsTrigger
                    value="reusableTasks"
                    className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-none data-[state=inactive]:bg-slate-100 dark:data-[state=inactive]:bg-slate-800"
                >
                    Reusable
                </TabsTrigger>
            </TabsList>

            <div className="flex-grow overflow-hidden relative">
                <TabsContent value="inbox" className="flex-grow overflow-auto">
                    {activeTab === "inbox" && (
                        <motion.div
                            key="inbox"
                            initial="hidden"
                            animate="visible"
                            variants={variants}
                            custom={direction}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            <TaskInteractionProvider listName={'INBOX'} tasks={inboxContext.tasks} setTasks={inboxContext.setTasks}>
                                <Inbox />
                            </TaskInteractionProvider>
                        </motion.div>
                    )}
                </TabsContent>
                <TabsContent value="reusableTasks" className="flex-grow overflow-auto">
                    {activeTab === "reusableTasks" && (
                        <motion.div
                            key="reusableTasks"
                            initial="hidden"
                            animate="visible"
                            variants={variants}
                            custom={direction}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            <TaskInteractionProvider listName={"REUSABLE"} tasks={reusableContext.tasks} setTasks={reusableContext.setTasks}>
                                <ReusableTaskPicker />
                            </TaskInteractionProvider>
                        </motion.div>
                    )}
                </TabsContent>
            </div>
        </Tabs>
    );
};
