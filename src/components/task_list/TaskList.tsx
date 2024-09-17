import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import { Task } from "../../service/taskService";
import { PlusButton } from "src/components/library/PlusButton";
import { TaskItem } from "src/components/task/TaskItem";

interface TaskListProps {
    title: string;
    tasks: Task[];
    droppableId: string;
    showAddButton?: boolean;
    onAddTask?: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
                                                      title,
                                                      tasks,
                                                      droppableId,
                                                      showAddButton,
                                                      onAddTask,
                                                  }) => {
    return (
        <div className="bg-slate-50 dark:bg-slate-900 p-4 pb-2 rounded-lg min-h-[200px] shadow shadow-slate-200 dark:shadow-slate-950">
            <TaskListHeader title={title} showAddButton={showAddButton} onAddTask={onAddTask} />
            <DroppableTasks droppableId={droppableId} tasks={tasks}/>
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
            {showAddButton && onAddTask && ( <PlusButton label='Create' onClick={onAddTask}/> )}
        </div>
    );
};

const DroppableTasks: React.FC<{
    droppableId: string;
    tasks: Task[];
}> = ({ droppableId, tasks }) => {
    return (
        <Droppable droppableId={droppableId}>
            {(provided, snapshot) => (
                <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`transition-colors duration-200 flex flex-col gap-0 ${snapshot.isDraggingOver ? "bg-slate-200 dark:bg-slate-700" : ""}`}
                >
                    {tasks.map((task, index) => (
                        <TaskItem key={task.id} task={task} index={index}/>
                    ))}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    );
};