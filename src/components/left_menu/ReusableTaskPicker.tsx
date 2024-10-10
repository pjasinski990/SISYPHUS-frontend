import React, { useEffect, useMemo, useRef } from 'react';
import { Card, CardContent } from 'src/components/ui/card';
import { Shortcut } from 'src/components/context/ShortcutsContext';
import { useRegisterShortcut } from 'src/components/context/RegisterShortcutContext';
import { TaskList } from 'src/components/task_list/TaskList';
import { TaskExtensionProvider } from 'src/components/context/TaskExtensionContext';
import { ArrowRight } from 'lucide-react';
import { useTaskList } from 'src/components/context/TaskListsContext';
import { Task, taskService } from '../../service/taskService';
import { useTaskAction } from 'src/components/context/TaskActionContext';

export const ReusableTaskPicker: React.FC = () => {
    const todoContext = useTaskList('DAILY_TODO');

    const addTaskToDailyPlan = async (newTask: Task) => {
        const addedTask = { ...newTask, listName: 'DAILY_TODO' };
        const createdTask = await taskService.createTask(addedTask);
        todoContext.setTasks([...todoContext.taskList.tasks, createdTask]);
    };

    const tasks = useTaskList('REUSABLE').taskList.tasks;
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
            id: 'add-task-reusable',
            keys: ['a'],
            action: () => openCreateTaskDialog('REUSABLE'),
            description: 'Add a new task to reusable tasks',
            order: 1,
        }),
        [openCreateTaskDialog]
    );

    useRegisterShortcut(addTaskShortcut);

    return (
        <Card className="flex flex-col flex-1">
            <CardContent
                ref={cardContentRef}
                className="flex-grow overflow-y-auto overflow-x-clip scrollbar-custom"
            >
                <TaskExtensionProvider
                    extraButtons={[
                        { icon: ArrowRight, handler: addTaskToDailyPlan },
                    ]}
                >
                    <div className="mt-2">
                        <TaskList
                            title={'Reusable Tasks'}
                            listName="REUSABLE"
                            tasks={tasks}
                            placeholderNode={
                                <>
                                    <span>reusable tasks.</span>
                                    <span>
                                        the building blocks of your boring life.
                                    </span>
                                </>
                            }
                            isDroppable={false}
                            showCreateButton={true}
                            onCreateTask={() =>
                                openCreateTaskDialog('REUSABLE')
                            }
                        />
                    </div>
                </TaskExtensionProvider>
            </CardContent>
        </Card>
    );
};
