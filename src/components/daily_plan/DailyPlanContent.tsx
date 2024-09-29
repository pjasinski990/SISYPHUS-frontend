import React from 'react';
import { TaskList } from 'src/components/task_list/TaskList';
import { TaskPropertiesProvider } from 'src/components/context/TaskPropertiesContext';
import { useTaskList } from 'src/components/context/TaskListsContext';
import { DailyPlanTodo } from 'src/components/daily_plan/DailyPlanTodo';
import { TaskInteractionProvider } from 'src/components/context/TaskInteractionContext';
import { getTimestamp, happenedToday } from 'src/lib/utils';
import { Task } from '../../service/taskService';

export const DailyPlanContent: React.FC = () => {
    const todoContext = useTaskList('DAILY_TODO');
    const doneContext = useTaskList('DAILY_DONE');
    const toDisplayInDoneList = [
        ...getTasksDoneTodaySorted(doneContext.tasks),
        ...filterUnfinishedTasks(doneContext.tasks),
    ];

    return (
        <div className="flex gap-4">
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
                tasks={toDisplayInDoneList}
                setTasks={doneContext.setTasks}
            >
                <TaskPropertiesProvider
                    isDraggable={true}
                    isFoldable={true}
                    initiallyFolded={true}
                >
                    <TaskList
                        title="Done"
                        tasks={toDisplayInDoneList}
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

function compareTasks(a: Task, b: Task): number {
    const timeA = getTimestamp(a.finishedAt!);
    const timeB = getTimestamp(b.finishedAt!);
    return timeB - timeA;
}

function filterFinishedToday(tasks: Task[]): Task[] {
    return tasks.filter(task => {
        if (!task.finishedAt) return false;
        const finishedDate = new Date(task.finishedAt);
        return happenedToday(finishedDate);
    });
}

function filterUnfinishedTasks(tasks: Task[]): Task[] {
    return tasks.filter(task => !task.finishedAt);
}

function getTasksDoneTodaySorted(tasks: Task[]) {
    const finishedToday = filterFinishedToday(tasks);
    return finishedToday.sort(compareTasks);
}
