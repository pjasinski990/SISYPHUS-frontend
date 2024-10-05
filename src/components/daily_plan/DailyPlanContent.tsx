import React, { useEffect } from 'react';
import { TaskList } from 'src/components/task_list/TaskList';
import { TaskPropertiesProvider } from 'src/components/context/TaskPropertiesContext';
import {
    useListFilters,
    useListOrder,
    useTaskList,
} from 'src/components/context/TaskListsContext';
import { DailyPlanTodo } from 'src/components/daily_plan/DailyPlanTodo';
import { getTimestamp, happenedToday } from 'src/lib/utils';
import { Task } from '../../service/taskService';

export const DailyPlanContent: React.FC = () => {
    const { setFilter } = useListFilters();
    const { setComparator } = useListOrder();
    const doneTasks = useTaskList('DAILY_DONE').taskList.tasks;

    useEffect(() => {
        setFilter('DAILY_DONE', task => {
            return finishedTodayFilter(task) || unfinishedFilter(task);
        });
        setComparator('DAILY_DONE', byTimeFinishedComparator);
    }, [setComparator, setFilter]);

    return (
        <div className="flex gap-4 h-[calc(100vh-200px)]">
            <TaskPropertiesProvider isDraggable={true} isFoldable={true}>
                <DailyPlanTodo />
            </TaskPropertiesProvider>
            <TaskPropertiesProvider
                isDraggable={true}
                isFoldable={true}
                initiallyFolded={true}
            >
                <TaskList
                    title={'Done'}
                    listName="DAILY_DONE"
                    tasks={doneTasks}
                    droppableId="DAILY_DONE"
                    placeholderNode={<span>drop your done tasks here.</span>}
                />
            </TaskPropertiesProvider>
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
