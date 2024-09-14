import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import { Task } from "../../service/taskService";
import { DraggableTaskItem } from "src/components/task/DraggableTaskItem";
import { PlusButton } from "src/components/library/PlusButton";

interface TaskListProps {
    title: string;
    tasks: Task[];
    droppableId: string;
    onEditTask: (task: Task) => void;
    onRemoveTask: (task: Task) => void;
}

interface ExtendableTaskListProps extends TaskListProps {
    showAddButton?: boolean;
    onRemoveTask: (task: Task) => void;
    onAddTask: () => void;
}

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

export const TaskList: React.FC<TaskListProps> = ({
                                                      title,
                                                      tasks,
                                                      droppableId,
                                                      onEditTask,
                                                      onRemoveTask,
                                                  }) => {
    return (
        <div className="bg-gray-50 dark:bg-slate-900 p-4 pb-2 rounded-lg min-h-[200px]">
            <TaskListHeader title={title} />
            <DroppableTaskList droppableId={droppableId} tasks={tasks} onEditTask={onEditTask} onRemoveTask={onRemoveTask}/>
        </div>
    );
};

export const ExtendableTaskList: React.FC<ExtendableTaskListProps> = ({
                                                                          title,
                                                                          tasks,
                                                                          droppableId,
                                                                          onAddTask,
                                                                          onEditTask,
                                                                          onRemoveTask,
                                                                      }) => {
    return (
        <div className="bg-gray-50 dark:bg-slate-900 p-4 pb-2 rounded-lg min-h-[200px]">
            <TaskListHeader title={title} showAddButton={true} onAddTask={onAddTask} />
            <DroppableTaskList droppableId={droppableId} tasks={tasks} onEditTask={onEditTask} onRemoveTask={onRemoveTask}/>
        </div>
    );
};

const DroppableTaskList: React.FC<{
    droppableId: string;
    tasks: Task[];
    onEditTask: (task: Task) => void;
    onRemoveTask: (task: Task) => void;
}> = ({ droppableId, tasks, onEditTask, onRemoveTask }) => {
    return (
        <Droppable droppableId={droppableId}>
            {(provided, snapshot) => (
                <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`transition-colors duration-200 flex flex-col gap-0 ${snapshot.isDraggingOver ? "bg-slate-200 dark:bg-slate-700" : ""}`}
                >
                    {tasks.map((task, index) => (
                        <DraggableTaskItem key={task.id} task={task} index={index} onEditTask={onEditTask} onRemoveTask={onRemoveTask}/>
                    ))}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    );
};
