import React, { useMemo } from 'react';
import { TaskList } from 'src/components/task_list/TaskList';
import { useRegisterShortcut } from 'src/components/context/RegisterShortcutContext';
import { Shortcut } from 'src/components/context/ShortcutsContext';
import { useTaskList } from 'src/components/context/TaskListsContext';
import { useTaskAction } from 'src/components/context/TaskActionContext';

export const DailyPlanTodo: React.FC = () => {
    const { openCreateTaskDialog } = useTaskAction();
    const { taskList } = useTaskList('DAILY_TODO');

    const addTaskShortcut: Shortcut = useMemo(
        () => ({
            id: 'add-task-daily-plan',
            keys: ['C'],
            action: () => openCreateTaskDialog('DAILY_TODO'),
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
            tasks={taskList.tasks}
            droppableId="DAILY_TODO"
            placeholderNode={<span>empty. well done!</span>}
            showCreateButton={true}
            onCreateTask={() => openCreateTaskDialog('DAILY_TODO')}
        />
    );
};
