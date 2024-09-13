import { apiService } from './apiService';

export enum TaskCategory {
    GREEN = 'GREEN',
    BLUE = 'BLUE',
    RED = 'RED',
    YELLOW = 'YELLOW',
    WHITE = 'WHITE',
    PINK = 'PINK',
}

export enum TaskSize {
    SMALL = 'SMALL',
    BIG = 'BIG',
}

export interface Task {
    id: string | null;
    ownerUsername: string;
    category: TaskCategory;
    size: TaskSize;
    title: string;
    description: string;
    reusable: boolean;
    createdAt: string;
    updatedAt: string;
    startTime: string;
}

class TaskService {
    async newTask(task: Task): Promise<Task> {
        return apiService.authenticatedPost(`/api/tasks/`, task);
    }
    async updateTask(task: Task): Promise<Task> {
        return apiService.authenticatedPut(`/api/tasks/`, task);
    }
}

export const taskService = new TaskService();
