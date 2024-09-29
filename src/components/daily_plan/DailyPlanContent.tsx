import React, { useEffect } from 'react';
import { TaskList } from 'src/components/task_list/TaskList';
import { TaskPropertiesProvider } from 'src/components/context/TaskPropertiesContext';
import {
    useListFilters,
    useListOrder,
    useTaskList,
} from 'src/components/context/TaskListsContext';
import { DailyPlanTodo } from 'src/components/daily_plan/DailyPlanTodo';
import { TaskInteractionProvider } from 'src/components/context/TaskInteractionContext';
import { getTimestamp, happenedToday } from 'src/lib/utils';
import { Task } from '../../service/taskService';

export const DailyPlanContent: React.FC = () => {
    const todoContext = useTaskList('DAILY_TODO');
    const doneContext = useTaskList('DAILY_DONE');
    const { setFilter } = useListFilters();
    const { setComparator } = useListOrder();

    useEffect(() => {
        setFilter('DAILY_DONE', task => {
            return finishedTodayFilter(task) || unfinishedFilter(task);
        });
        setComparator('DAILY_DONE', byTimeFinishedComparator);
    }, [setComparator, setFilter]);

    return (
        <div className="flex gap-4 h-[calc(100vh-200px)]">
            <TaskInteractionProvider
                listName={'DAILY_TODO'}
                tasks={todoContext.tasks}
                setTasks={todoContext.setTasks}
            >
                <TaskPropertiesProvider isDraggable={true} isFoldable={true}>
                    <DailyPlanTodo />
                </TaskPropertiesProvider>
            </TaskInteractionProvider>
            <TaskInteractionProvider
                listName={'DAILY_DONE'}
                tasks={doneContext.tasks}
                setTasks={doneContext.setTasks}
            >
                <TaskPropertiesProvider
                    isDraggable={true}
                    isFoldable={true}
                    initiallyFolded={true}
                >
                    <TaskList
                        title="Done"
                        tasks={doneContext.tasks}
                        droppableId="DAILY_DONE"
                        placeholderNode={
                            <span>drop your done tasks here.</span>
                        }
                    />
                </TaskPropertiesProvider>
            </TaskInteractionProvider>
        </div>
    );
};

function byTimeFinishedComparator(a: Task, b: Task): number {
    const timeA = getTimestamp(a.finishedAt!);
    const timeB = getTimestamp(b.finishedAt!);
    return timeB - timeA;
}

function finishedTodayFilter(task: Task): boolean {
    if (!task.finishedAt) return false;
    const finishedDate = new Date(task.finishedAt);
    return happenedToday(finishedDate);
}

function unfinishedFilter(task: Task): boolean {
    return !task.finishedAt;
}
