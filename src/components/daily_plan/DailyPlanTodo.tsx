import React, { useMemo } from 'react';
import { TaskList } from "src/components/task_list/TaskList";
import { TaskPropertiesProvider } from "src/components/context/TaskPropertiesContext";
import { useRegisterShortcut } from "src/components/context/RegisterShortcutContext";
import { Shortcut } from "src/components/context/ShortcutsContext";
import { useTaskInteraction } from "src/components/context/TaskInteractionContext";
import { useTaskLists } from "src/components/context/TaskListsContext";

export const DailyPlanTodo: React.FC = () => {
    const { openCreateTaskDialog } = useTaskInteraction()
    const { tasks } = useTaskLists('DAILY_TODO')

    const addTaskShortcut: Shortcut = useMemo(() => ({
        id: 'add-task-daily-plan',
        keys: ['C'],
        action: openCreateTaskDialog,
        description: 'Add a new task to today\'s todo list',
        order: 1,
    }), [openCreateTaskDialog]);

    useRegisterShortcut(addTaskShortcut);

    return (
        <TaskPropertiesProvider isDraggable={true} isFoldable={true}>
            <TaskList
                title="Todo"
                tasks={tasks}
                droppableId="todo"
                placeholderNode={<span>empty. well done!</span>}
                showCreateButton={true}
                onCreateTask={openCreateTaskDialog}
            />
        </TaskPropertiesProvider>
    );
};
