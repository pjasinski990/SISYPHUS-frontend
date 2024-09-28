import React, { createContext, useCallback, useContext } from 'react';
import { DraggableLocation, DropResult } from '@hello-pangea/dnd';
import { taskService } from '../../service/taskService';
import { useTaskLists } from 'src/components/context/TaskListsContext';

interface TaskDragDropContextType {
    onDragEnd: (result: DropResult) => Promise<void>;
}

const TaskDragDropContext = createContext<TaskDragDropContextType | undefined>(
    undefined
);

export const TaskDragDropProvider: React.FC<{
    listNames: string[];
    children: React.ReactNode;
}> = ({ listNames, children }) => {
    const taskLists = useTaskLists(listNames);

    const isValidDragAction = useCallback(
        (
            source: DraggableLocation,
            destination: DraggableLocation | null | undefined
        ) => {
            if (!destination || !listNames.includes(destination.droppableId)) {
                return false;
            }
            return !(
                source.droppableId === destination.droppableId &&
                source.index === destination.index
            );
        },
        [listNames]
    );

    const onDragEnd = useCallback(
        async (result: DropResult) => {
            const { source, destination } = result;
            if (!isValidDragAction(source, destination)) {
                return;
            }

            const sourceContext = taskLists[source.droppableId];
            const destContext = taskLists[destination!!.droppableId];

            const [movedTask] = sourceContext.tasks.splice(source.index, 1);
            if (destination?.droppableId === 'DAILY_DONE') {
                movedTask.finishedAt = new Date().toISOString();
            }

            destContext.tasks.splice(destination!!.index, 0, movedTask);
            sourceContext.setTasks(sourceContext.tasks);
            destContext.setTasks(destContext.tasks);

            await taskService.updateTask({
                ...movedTask,
                listName: destination!!.droppableId,
            });
        },
        [isValidDragAction, taskLists]
    );

    return (
        <TaskDragDropContext.Provider
            value={{
                onDragEnd,
            }}
        >
            {children}
        </TaskDragDropContext.Provider>
    );
};

export const useTaskDragAndDrop = () => {
    const context = useContext(TaskDragDropContext);
    if (context === undefined) {
        throw new Error(
            'useTaskDragAndDrop must be used within a TaskDragAndDropProvider'
        );
    }
    return context;
};
