import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { TaskList } from "src/components/task_list/TaskList";
import { TaskPropertiesProvider } from "src/components/context/TaskPropertiesContext";
import { useTaskList } from "src/components/context/TaskListsContext";
import { DailyPlanTodo } from "src/components/daily_plan/DailyPlanTodo";
import { TaskInteractionProvider } from "src/components/context/TaskInteractionContext";
import { useTaskDragAndDrop } from "src/components/context/TaskDragDropContext";

export const DailyPlanContent: React.FC = () => {
    const todoContext = useTaskList('DAILY_TODO')
    const doneContext = useTaskList('DAILY_DONE')
    const { onDragEnd } = useTaskDragAndDrop()

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4">
                <TaskInteractionProvider listName={'DAILY_TODO'} tasks={todoContext.tasks} setTasks={todoContext.setTasks}>
                    <TaskPropertiesProvider isDraggable={true} isFoldable={true}>
                        <DailyPlanTodo />
                    </TaskPropertiesProvider>
                </TaskInteractionProvider>
                <TaskInteractionProvider listName={'DAILY_DONE'} tasks={doneContext.tasks} setTasks={doneContext.setTasks}>
                    <TaskPropertiesProvider isDraggable={true} isFoldable={true}>
                        <TaskList
                            title="Done"
                            tasks={doneContext.tasks}
                            droppableId="DAILY_DONE"
                            placeholderNode={<span>drop your done tasks here.</span>}
                        />
                    </TaskPropertiesProvider>
                </TaskInteractionProvider>
            </div>
        </DragDropContext>
    );
};
