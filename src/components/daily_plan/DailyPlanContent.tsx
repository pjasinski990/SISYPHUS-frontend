import React, { useCallback } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { TaskList } from "src/components/task_list/TaskList";
import { TaskPropertiesProvider } from "src/components/context/TaskPropertiesContext";
import { useTaskLists } from "src/components/context/TaskListsContext";
import { DailyPlanTodo } from "src/components/daily_plan/DailyPlanTodo";
import { TaskInteractionProvider } from "src/components/context/TaskInteractionContext";

export const DailyPlanContent: React.FC = () => {
    const todoContext = useTaskLists('DAILY_TODO')
    const doneContext = useTaskLists('DAILY_DONE')

    const handleDragEnd = useCallback(async (result: DropResult) => {
        // await onDragEnd(result);
    }, []);

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4">
                <TaskInteractionProvider listName={'DAILY_TODO'} tasks={todoContext.tasks} setTasks={todoContext.setTasks}>
                    <DailyPlanTodo />
                </TaskInteractionProvider>
                <TaskPropertiesProvider isDraggable={true} isFoldable={true}>
                    <TaskList
                        title="Done"
                        tasks={doneContext.tasks}
                        droppableId="done"
                        placeholderNode={<span>drop your done tasks here.</span>}
                    />
                </TaskPropertiesProvider>
            </div>
        </DragDropContext>
    );
};
