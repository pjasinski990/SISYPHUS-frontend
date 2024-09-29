import React, { useEffect, useMemo, useRef } from 'react';
import { Card, CardContent } from 'src/components/ui/card';
import { TaskList } from 'src/components/task_list/TaskList';
import { useTaskInteraction } from 'src/components/context/TaskInteractionContext';
import { useTaskList } from 'src/components/context/TaskListsContext';
import { useRegisterShortcut } from 'src/components/context/RegisterShortcutContext';
import { Shortcut } from 'src/components/context/ShortcutsContext';

export const Inbox: React.FC = () => {
    const tasks = useTaskList('INBOX').tasks;
    const { openCreateTaskDialog } = useTaskInteraction();

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
        <Card className="flex flex-col flex-1">
            <CardContent ref={cardContentRef} className="scrollbar-custom">
                <div className={'mt-2'}>
                    <TaskList
                        title={'Inbox'}
                        tasks={tasks}
                        droppableId={'INBOX'}
                        showCreateButton={true}
                        onCreateTask={openCreateTaskDialog}
                        placeholderNode={
                            <>
                                <span>inbox.</span>
                                <span>throw all of your concerns inside.</span>
                            </>
                        }
                    />
                </div>
            </CardContent>
        </Card>
    );
};
