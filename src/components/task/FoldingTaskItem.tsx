import { Task } from "../../service/taskService";
import React from "react";
import { TaskItemContent } from "src/components/task/TaskItemContent";
import { DraggableProvided, DraggableStateSnapshot } from "@hello-pangea/dnd";

interface FoldingTaskItemProps {
    task: Task;
    index?: number
    provided?: DraggableProvided;
    snapshot?: DraggableStateSnapshot;
}

export const FoldingTaskItem: React.FC<FoldingTaskItemProps> = ({ task }) => {
    const [isFolded, setIsFolded] = React.useState(false);

    return (
        <div onClick={() => setIsFolded(!isFolded)}>
            <TaskItemContent task={task} showMetadata={!isFolded}/>
        </div>
    );
};
