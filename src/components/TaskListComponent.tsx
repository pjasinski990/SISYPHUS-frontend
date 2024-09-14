import React from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { Task, TaskCategory } from "../service/taskService";
import { Button } from "src/components/ui/button";
import { PlusCircle, Edit } from "lucide-react";

interface TaskListProps {
    title: string;
    tasks: Task[];
    droppableId: string;
    onEditTask: (task: Task) => void;
}

interface ExtendableTaskListProps extends TaskListProps {
    showAddButton?: boolean;
    onAddTask?: () => void;
}

interface TaskItemProps {
    task: Task;
    index: number;
    onEditTask: (task: Task) => void;
}

const categoryColors: Record<TaskCategory, string> = {
    [TaskCategory.GREEN]: "bg-green-100 dark:bg-green-800",
    [TaskCategory.BLUE]: "bg-blue-100 dark:bg-blue-800",
    [TaskCategory.RED]: "bg-red-100 dark:bg-red-800",
    [TaskCategory.YELLOW]: "bg-yellow-100 dark:bg-yellow-700",
    [TaskCategory.WHITE]: "bg-gray-100 dark:bg-gray-500",
    [TaskCategory.PINK]: "bg-pink-100 dark:bg-pink-800",
};

const categoryHoverColors: Record<TaskCategory, string> = {
    [TaskCategory.GREEN]: "hover:bg-green-200 dark:hover:bg-green-900",
    [TaskCategory.BLUE]: "hover:bg-blue-200 dark:hover:bg-blue-900",
    [TaskCategory.RED]: "hover:bg-red-200 dark:hover:bg-red-900",
    [TaskCategory.YELLOW]: "hover:bg-yellow-200 dark:hover:bg-yellow-800",
    [TaskCategory.WHITE]: "hover:bg-gray-200 dark:hover:bg-gray-600",
    [TaskCategory.PINK]: "hover:bg-pink-200 dark:hover:bg-pink-900",
}

const TaskItem: React.FC<TaskItemProps> = ({ task, index, onEditTask }) => {
    const categoryClass = categoryColors[task.category];
    const categoryEditButtonClass = categoryHoverColors[task.category];

    return (
        <Draggable draggableId={String(task.id)} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`p-4 mb-2 rounded shadow-md text-gray-800 dark:text-gray-100 ${categoryClass} ${
                        snapshot.isDragging ? "opacity-75" : ""
                    }`}
                >
                    <div
                        {...provided.dragHandleProps}
                        className="flex justify-between items-start"
                    >
                        <div>
                            <h4 className="font-semibold">{task.title}</h4>
                            <p className="text-sm">{task.description}</p>
                            <TaskMetadata task={task} />
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditTask(task)}
                            className={`ml-2 ${categoryEditButtonClass}`}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

const TaskMetadata: React.FC<{ task: Task }> = ({ task }) => (
    <div className="text-xs mt-1 text-gray-600 dark:text-gray-300">
        <span className="mr-2">Category: {task.category}</span>
        <span className="mr-2">Size: {task.size}</span>
        <span>Start: {task.startTime}</span>
    </div>
);

export const TaskList: React.FC<TaskListProps> = ({
                                                      title,
                                                      tasks,
                                                      droppableId,
                                                      onEditTask,
                                                  }) => {
    return (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg min-h-[200px]">
            <TaskListHeader title={title} />
            <DroppableTaskList droppableId={droppableId} tasks={tasks} onEditTask={onEditTask} />
        </div>
    );
};

export const ExtendableTaskList: React.FC<ExtendableTaskListProps> = ({
                                                                          title,
                                                                          tasks,
                                                                          droppableId,
                                                                          onAddTask,
                                                                          onEditTask,
                                                                      }) => {
    return (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 pb-2 rounded-lg min-h-[200px]">
            <TaskListHeader title={title} showAddButton={true} onAddTask={onAddTask} />
            <DroppableTaskList droppableId={droppableId} tasks={tasks} onEditTask={onEditTask} />
        </div>
    );
};

const TaskListHeader: React.FC<{
    title: string;
    showAddButton?: boolean;
    onAddTask?: () => void;
}> = ({ title, showAddButton = false, onAddTask }) => {
    return (
        <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
            {showAddButton && onAddTask && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onAddTask}
                    className="flex items-center dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200"
                >
                    <PlusCircle className="mr-1 h-4 w-4" />
                    Add
                </Button>
            )}
        </div>
    );
};

const DroppableTaskList: React.FC<{
    droppableId: string;
    tasks: Task[];
    onEditTask: (task: Task) => void;
}> = ({ droppableId, tasks, onEditTask }) => {
    return (
        <Droppable droppableId={droppableId}>
            {(provided, snapshot) => (
                <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`transition-colors duration-200 ${snapshot.isDraggingOver ? "bg-slate-200 dark:bg-slate-700" : ""}`}
                >
                    {tasks.map((task, index) => (
                        <TaskItem key={task.id} task={task} index={index} onEditTask={onEditTask} />
                    ))}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    );
};
