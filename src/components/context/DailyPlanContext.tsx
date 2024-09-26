import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { formatToIsoDate } from 'src/lib/utils';
import { DraggableLocation, DropResult } from '@hello-pangea/dnd';
import { TaskFormData } from 'src/components/task/TaskForm';
import { DailyPlan, dailyPlanService } from "../../service/dailyPlanService";
import { Task, taskService } from "../../service/taskService";
import { useAuth } from "src/components/context/AuthContext";
import { ObjectId } from "bson";

interface DailyPlanContextType {
    dailyPlan: DailyPlan | null;
    setDailyPlan: React.Dispatch<React.SetStateAction<DailyPlan | null>>;
    onDragEnd: (result: DropResult) => Promise<void>;
    onRemoveTask: (taskId: string) => Promise<void>;
    onCreateTask: (task: TaskFormData) => void;
    onAddTask: (task: Task) => void;
    onEditTask: (taskId: string, updatedTaskData: TaskFormData) => Promise<void>;
}

const DailyPlanContext = createContext<DailyPlanContextType | undefined>(undefined);

export const DailyPlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
    const { username } = useAuth()

    useEffect(() => {
        const fetchData = async () => {
            const date = formatToIsoDate(new Date());
            try {
                const [dailyPlanData] = await Promise.all([
                    dailyPlanService.getDailyPlan(date),
                    taskService.getTasks()
                ]);
                setDailyPlan(dailyPlanData.plan);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData().then();
    }, []);

    const isValidDragAction = useCallback((source: DraggableLocation, destination: DraggableLocation | null | undefined) => {
        if (!destination) {
            return false;
        }
        return !(
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        );
    }, []);

    const moveTask = useCallback((dailyPlan: DailyPlan, source: DraggableLocation, destination: DraggableLocation) => {
        const newDailyPlan: DailyPlan = { ...dailyPlan };
        const sourceList = source.droppableId === 'todo' ? newDailyPlan.todo : newDailyPlan.done;
        const destList = destination.droppableId === 'todo' ? newDailyPlan.todo : newDailyPlan.done;

        if (sourceList && destList) {
            const [movedTask] = sourceList.splice(source.index, 1);
            if (destination?.droppableId === 'done') {
                movedTask.finishedAt = new Date().toISOString()
            }
            destList.splice(destination.index, 0, movedTask);
        }
        return newDailyPlan;
    }, []);

    const onDragEnd = useCallback(async (result: DropResult) => {
        const { source, destination } = result;
        if (!isValidDragAction(source, destination) || !dailyPlan) {
            return;
        }
        const newDailyPlan = moveTask(dailyPlan, source, destination!);
        setDailyPlan(newDailyPlan);
        await dailyPlanService.updateDailyPlan(newDailyPlan);
    }, [dailyPlan, isValidDragAction, moveTask]);

    const removeTask = useCallback(async (taskId: string) => {
        try {
            if (!dailyPlan) return;
            const updatedDailyPlan = removeTaskFromDailyPlan(dailyPlan, taskId);
            setDailyPlan(updatedDailyPlan);
            await dailyPlanService.updateDailyPlan(updatedDailyPlan);
        } catch (error) {
            console.error('Failed to remove task:', error);
        }
    }, [dailyPlan]);

    const createTask = useCallback(async (taskData: TaskFormData) => {
        try {
            let newTask: Task = {
                id: new ObjectId().toHexString(),
                ...taskData,
                ownerUsername: username!,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                finishedAt: null,
            };
            const updatedDailyPlan = { ...dailyPlan, todo: [...dailyPlan?.todo || [], newTask] } as DailyPlan;
            setDailyPlan(updatedDailyPlan);
            await dailyPlanService.updateDailyPlan(updatedDailyPlan);
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    }, [dailyPlan, username]);

    const addTask = useCallback(async (newTask: Task) => {
        try {
            if (!dailyPlan || !newTask.id || findTaskInDailyPlan(dailyPlan, newTask.id)) {
                return;
            }
            const updatedDailyPlan = { ...dailyPlan, todo: [...dailyPlan.todo, newTask] } as DailyPlan;
            setDailyPlan(updatedDailyPlan);
            await dailyPlanService.updateDailyPlan(updatedDailyPlan);
        } catch (error) {
            console.error('Failed to move task:', error);
        }
    }, [dailyPlan]);

    const editTask = useCallback(async (taskId: string, updatedTaskData: TaskFormData) => {
        try {
            if (!dailyPlan) return;
            const taskToUpdate = findTaskInDailyPlan(dailyPlan, taskId);
            if (!taskToUpdate) {
                console.log('Error: task not found');
                return;
            }

            const updatedTask: Task = {
                ...taskToUpdate,
                ...updatedTaskData,
                updatedAt: new Date().toISOString(),
            };

            const updatedDailyPlan = updateTaskInDailyPlan(dailyPlan, updatedTask);

            setDailyPlan(updatedDailyPlan);
            await dailyPlanService.updateDailyPlan(updatedDailyPlan);
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    }, [dailyPlan]);

    const findTaskInDailyPlan = (dailyPlan: DailyPlan, taskId: string): Task | null => {
        return (
            dailyPlan.todo.find((task) => task.id === taskId) ||
            dailyPlan.done.find((task) => task.id === taskId) ||
            null
        );
    };

    const updateTaskInDailyPlan = (dailyPlan: DailyPlan, updatedTask: Task): DailyPlan => {
        return {
            ...dailyPlan,
            todo: dailyPlan.todo.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
            done: dailyPlan.done.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
        };
    };

    const removeTaskFromDailyPlan = (dailyPlan: DailyPlan, taskId: string): DailyPlan => {
        return {
            ...dailyPlan,
            todo: dailyPlan.todo.filter((task) => task.id !== taskId),
            done: dailyPlan.done.filter((task) => task.id !== taskId),
        };
    };

    return (
        <DailyPlanContext.Provider
            value={{
                dailyPlan,
                setDailyPlan,
                onDragEnd,
                onCreateTask: createTask,
                onAddTask: addTask,
                onRemoveTask: removeTask,
                onEditTask: editTask,
            }}
        >
            {children}
        </DailyPlanContext.Provider>
    );
};

export const useDailyPlan = () => {
    const context = useContext(DailyPlanContext);
    if (context === undefined) {
        throw new Error('useDailyPlan must be used within a DailyPlanProvider');
    }
    return context;
};
