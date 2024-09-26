import React, { useEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "src/components/ui/card";
import { TaskPropertiesProvider } from "src/components/context/TaskPropertiesContext";
import { useDailyPlan } from "src/components/context/DailyPlanContext";
import { Shortcut } from "src/components/context/ShortcutsContext";
import { useRegisterShortcut } from "src/components/context/RegisterShortcutContext";
import { TaskList } from "src/components/task_list/TaskList";
import { TaskExtensionProvider } from "src/components/context/TaskExtensionContext";
import { ArrowRight } from "lucide-react";
import { useTaskInteraction } from "src/components/context/TaskInteractionContext";
import { useTaskLists } from "src/components/context/TaskListsContext";

export const ReusableTaskPicker: React.FC = () => {
    const addTaskToDailyPlan = useDailyPlan().onAddTask;

    const tasks = useTaskLists('REUSABLE').tasks
    const { openCreateTaskDialog } = useTaskInteraction()

    const cardContentRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (cardContentRef.current) {
            cardContentRef.current.scrollTo({
                left: 0,
                behavior: 'smooth',
            });
        }
    }, [tasks]);

    const addTaskShortcut: Shortcut = useMemo(
        () => ({
            id: 'add-task-reusable',
            keys: ['A'],
            action: openCreateTaskDialog,
            description: 'Add a new task to reusable tasks',
            order: 1,
        }),
        [openCreateTaskDialog]
    );

    useRegisterShortcut(addTaskShortcut);

    return (
        <Card className="flex flex-col min-h-[calc(100vh-150px)]">
            <CardContent
                ref={cardContentRef}
                className="flex-grow h-full overflow-y-auto overflow-x-clip scrollbar-custom"
            >
                <TaskPropertiesProvider isDraggable={false} isFoldable={true}>
                    <TaskExtensionProvider extraButtons={[{icon: ArrowRight, handler: addTaskToDailyPlan}]}>
                        <div className={'mt-6'}>
                            <TaskList
                                tasks={tasks}
                                placeholderNode={
                                    <>
                                        <span>reusable tasks.</span>
                                        <span>the building blocks of your monotone life.</span>
                                    </>
                                }
                                title={'Reusable tasks'}
                                isDroppable={false}
                                showCreateButton={true}
                                onCreateTask={openCreateTaskDialog}
                            />
                        </div>
                    </TaskExtensionProvider>
                </TaskPropertiesProvider>
            </CardContent>
        </Card>
    );
};
