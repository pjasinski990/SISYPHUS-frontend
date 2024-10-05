import { apiService } from './apiService';
import { TaskList } from 'src/lib/taskList';

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
    listName: string;
    startTime: string;
    duration: string; // ISO-8601 format (PT2H30M)
    createdAt: string;
    updatedAt: string;
    finishedAt: string | null;
}

class TaskService {
    async getTasks(): Promise<Task[]> {
        return apiService.authenticatedGet(`/api/tasks/`);
    }

    async getTasksList(listName: string): Promise<TaskList> {
        const tasks = (await apiService.authenticatedGet(`/api/tasks/list`, {
            params: { listName },
        })) as Task[];

        return { name: listName, tasks: tasks, displayOrder: 0 };
    }

    async createTask(task: Task): Promise<Task> {
        return apiService.authenticatedPost(`/api/tasks/`, task);
    }

    async updateTask(task: Task): Promise<Task> {
        return apiService.authenticatedPut(`/api/tasks/`, task);
    }

    async deleteTask(taskId: string): Promise<Task> {
        return apiService.authenticatedDelete(`/api/tasks/${taskId}`);
    }
}

export const taskService = new TaskService();
