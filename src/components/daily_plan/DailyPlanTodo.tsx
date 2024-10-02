import React, { useMemo } from 'react';
import { TaskList } from 'src/components/task_list/TaskList';
import { useRegisterShortcut } from 'src/components/context/RegisterShortcutContext';
import { Shortcut } from 'src/components/context/ShortcutsContext';
import { useTaskInteraction } from 'src/components/context/TaskInteractionContext';
import { useTaskList } from 'src/components/context/TaskListsContext';

export const DailyPlanTodo: React.FC = () => {
    const { openCreateTaskDialog } = useTaskInteraction();
    const { tasks } = useTaskList('DAILY_TODO');

    const addTaskShortcut: Shortcut = useMemo(
        () => ({
            id: 'add-task-daily-plan',
            keys: ['C'],
            action: openCreateTaskDialog,
            description: "Add a new task to today's todo list",
            order: 1,
        }),
        [openCreateTaskDialog]
    );

    useRegisterShortcut(addTaskShortcut);

    return (
        <TaskList
            title={'Todo'}
            listName="DAILY_TODO"
            tasks={tasks}
            droppableId="DAILY_TODO"
            placeholderNode={<span>empty. well done!</span>}
            showCreateButton={true}
            onCreateTask={openCreateTaskDialog}
        />
    );
};
