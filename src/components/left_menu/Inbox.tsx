import React, { useEffect, useMemo, useRef } from 'react';
import { Card, CardContent } from 'src/components/ui/card';
import { TaskList } from 'src/components/task_list/TaskList';
import { useTaskList } from 'src/components/context/TaskListsContext';
import { useRegisterShortcut } from 'src/components/hooks/useRegisterShortcut';
import { Shortcut } from 'src/components/context/ShortcutsContext';
import { useTaskAction } from 'src/components/context/TaskActionContext';

export const Inbox: React.FC = () => {
    const tasks = useTaskList('INBOX').taskList.tasks;
    const { openCreateTaskDialog } = useTaskAction();

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
            keys: ['a'],
            action: () => openCreateTaskDialog('INBOX'),
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
                        listName={'INBOX'}
                        tasks={tasks}
                        droppableId={'INBOX'}
                        showCreateButton={true}
                        onCreateTask={() => openCreateTaskDialog('INBOX')}
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
