import React, { useEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "src/components/ui/card";
import { TaskPropertiesProvider } from "src/components/context/TaskPropertiesContext";
import { TaskList } from "src/components/task_list/TaskList";
import { useTaskInteraction } from "src/components/context/TaskInteractionContext";
import { useTaskLists } from "src/components/context/TaskListsContext";
import { useRegisterShortcut } from "src/components/context/RegisterShortcutContext";
import { Shortcut } from "src/components/context/ShortcutsContext";

export const Inbox: React.FC = () => {
    const tasks = useTaskLists('INBOX').tasks;
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
            id: 'add-task-inbox',
            keys: ['A'],
            action: openCreateTaskDialog,
            description: 'Add a new task to inbox',
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
                <div className={'mt-6'}>
                    <TaskPropertiesProvider isDraggable={true} isFoldable={true}>
                        <TaskList
                            tasks={tasks}
                            placeholderNode={
                                <>
                                    <span>inbox.</span>
                                    <span>throw all of your concerns inside.</span>
                                </>
                            }
                            title={'Inbox'}
                            droppableId={'inbox'}
                            isDroppable={true}
                            showCreateButton={true}
                            onCreateTask={openCreateTaskDialog}
                        />
                    </TaskPropertiesProvider>
                </div>
            </CardContent>
        </Card>
    );
};
