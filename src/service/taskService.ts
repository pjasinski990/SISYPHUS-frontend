import { apiService } from "./apiService";

export enum TaskCategory {
    GREEN,
    BLUE,
    RED,
    YELLOW,
    WHITE,
    PINK,
}

export enum TaskSize {
    SMALL,
    BIG,
}

export interface Task {
    id: string | null,
    ownerUsername: string,
    category: TaskCategory,
    size: TaskSize,
    title: string,
    description: string,
    reusable: boolean,
    createdAt: string,
    updatedAt: string,
    startTime: string,
}

class TaskService {
    async newTask(task: Task): Promise<Task> {
        return apiService.authenticatedPost(`/api/tasks/new`, task);
    }
    async updateTask(task: Task): Promise<Task> {
        return apiService.authenticatedPut(`/api/tasks/${task.id}`, task);
    }
}

export const taskService = new TaskService()
