import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import { Task } from "../../service/taskService";
import { PlusButton } from "src/components/library/Buttons";
import { TaskItem } from "src/components/task/TaskItem";

interface TaskListProps {
    title: string;
    tasks: Task[];
    droppableId?: string;
    placeholderNode: string | React.ReactNode;
    showCreateButton?: boolean;
    onCreateTask?: () => void;
    isDroppable?: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({
                                                      title,
                                                      tasks,
                                                      droppableId,
                                                      placeholderNode,
                                                      showCreateButton,
                                                      onCreateTask,
                                                      isDroppable = true,
                                                  }) => {
    return (
        <div className="bg-slate-50 dark:bg-slate-900 p-4 pb-2 rounded-md min-h-[300px] shadow shadow-slate-200 dark:shadow-slate-950 w-[350px] max-h-[calc(100vh-200px)] overflow-auto">
            <TaskListHeader title={title} showAddButton={showCreateButton} onAddTask={onCreateTask} />
            {isDroppable && droppableId ? (
                <DroppableTasks droppableId={droppableId} tasks={tasks} placeholderNode={placeholderNode} />
            ) : (
                <NonDroppableTasks tasks={tasks} placeholderNode={placeholderNode} />
            )}
        </div>
    );
};

const TaskListHeader: React.FC<{
    title: string;
    showAddButton?: boolean;
    onAddTask?: () => void;
}> = ({ title, showAddButton = false, onAddTask }) => {
    return (
        <div className="flex justify-between items-center mb-2 min-h-[48px]">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
            {showAddButton && onAddTask && <PlusButton label="Create" onClick={onAddTask} />}
        </div>
    );
};

const DroppableTasks: React.FC<{
    droppableId: string;
    tasks: Task[];
    placeholderNode: string | React.ReactNode;
}> = ({ droppableId, tasks, placeholderNode }) => {
    return (
        <Droppable droppableId={droppableId}>
            {(provided, snapshot) => (
                <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`transition-colors duration-200 flex flex-col gap-1 min-h-[100px] ${
                        snapshot.isDraggingOver ? "bg-slate-200 dark:bg-slate-700" : ""
                    }`}
                >
                    {tasks.map((task, index) => (
                        <TaskItem key={task.id} task={task} index={index} />
                    ))}
                    {provided.placeholder}
                    {tasks.length === 0 && !snapshot.isDraggingOver && (
                        <div className="h-[120px] flex flex-col space-y-2 items-center justify-center text-center font-mono text-slate-300 dark:text-slate-700 whitespace-pre-line">
                            {placeholderNode}
                        </div>
                    )}
                </div>
            )}
        </Droppable>
    );
};

const NonDroppableTasks: React.FC<{
    tasks: Task[];
    placeholderNode: string | React.ReactNode;
}> = ({ tasks, placeholderNode }) => {
    return (
        <div className="flex flex-col gap-1 min-h-[100px]">
            {tasks.map((task) => (
                <TaskItem key={task.id} task={task} />
            ))}
            {tasks.length === 0 && (
                <div className="h-[120px] flex flex-col space-y-2 items-center justify-center text-center font-mono text-slate-300 dark:text-slate-700">
                    {placeholderNode}
                </div>
            )}
        </div>
    );
};
