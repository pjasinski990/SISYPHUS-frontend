import { Task } from "../../service/taskService";
import React from "react";
import { TaskItemContent } from "src/components/task/TaskItemContent";
import { TaskPropertiesProvider, useTaskProperties } from "src/components/context/TaskPropertiesContext";
import { Draggable } from "@hello-pangea/dnd";
import { DraggableProvider } from "src/components/context/DraggableContext";
import { DraggableWrapper } from "src/components/library/DraggableWrapper";

interface TaskItemProps {
    task: Task;
    index?: number;
    isVanity?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, index, isVanity = false }) => {
    if (isVanity) {
        return ( <VanityTask task={task} /> );
    }
    return (
        <TaskDispatcher task={task} index={index}/>
    )
};

const VanityTask: React.FC<TaskItemProps> = ({task}) => {
    return (
        <TaskPropertiesProvider
            onTaskEdit={() => {}}
            onTaskRemove={() => {}}
            isDraggable={false}
            isFoldable={false}
        >
            <TaskItemContent task={task} />
        </TaskPropertiesProvider>
    );
}

const TaskDispatcher: React.FC<TaskItemProps> = ({ task, index }) => {
    const { isDraggable, isFoldable } = useTaskProperties();

    let content = <TaskItemContent task={task} />;

    if (isFoldable) {
        content = <FoldableTaskItem task={task}>{content}</FoldableTaskItem>;
    }

    if (isDraggable) {
        if (index === undefined) {
            throw new Error("Attempting to create draggable task but no index provided!");
        }
        content = (
            <DraggableTaskItem task={task} index={index}>
                {content}
            </DraggableTaskItem>
        );
    }

    return content;
};

const DraggableTaskItem: React.FC<TaskItemProps & { children: React.ReactNode }> = ({ task, index, children }) => {
    return (
        <Draggable draggableId={String(task.id)} index={index!}>
            {(provided, snapshot) => (
                <DraggableProvider provided={provided} snapshot={snapshot}>
                    <DraggableWrapper>
                        {children}
                    </DraggableWrapper>
                </DraggableProvider>
            )}
        </Draggable>
    );
};

const FoldableTaskItem: React.FC<TaskItemProps & { children: React.ReactNode }> = ({ task, children }) => {
    const [isFolded, setIsFolded] = React.useState(false);

    return (
        <div onClick={() => setIsFolded(!isFolded)}>
            {React.cloneElement(children as React.ReactElement<any>, { showMetadata: !isFolded })}
        </div>
    );
};
