import { PersistenceProvider } from './PersistenceProvider';
import { Task } from '../service/taskService';
import React from 'react';
import { TaskList } from '../lib/taskList';

export class InMemoryPersistenceProvider implements PersistenceProvider {
    private readonly getTasks: () => Task[];
    private readonly setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    private readonly getTaskList: (listName: string) => TaskList | null;

    constructor(
        getTasks: () => Task[],
        setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
        getTaskList: (listName: string) => TaskList | null
    ) {
        this.getTasks = getTasks;
        this.setTasks = setTasks;
        this.getTaskList = getTaskList;
    }

    createTask(task: Task): Promise<Task> {
        this.setTasks([...this.getTasks(), task]);
        return Promise.resolve(task);
    }

    updateTask(task: Task): Promise<Task | null> {
        const updated = this.getTasks().find(t => t.id === task.id);
        if (!updated) {
            return Promise.resolve(null);
        }
        const updatedTasks = this.getTasks().map(t => {
            if (t.id === task.id) {
                return task;
            }
            return t;
        });
        this.setTasks(updatedTasks);
        return Promise.resolve(task);
    }

    deleteTask(taskId: string): Promise<Task | null> {
        const deleted = this.getTasks().find(t => t.id === taskId);
        if (!deleted) {
            return Promise.resolve(null);
        }
        const updatedTasks = this.getTasks().filter(t => t.id !== taskId);
        this.setTasks(updatedTasks);
        return Promise.resolve(deleted);
    }

    fetchTaskList(listName: string): Promise<TaskList | null> {
        return Promise.resolve(this.getTaskList(listName));
    }
}
