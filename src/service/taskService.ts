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
    title: string;
    category: TaskCategory;
    size: TaskSize;
    listName: string;
    description: string | null;
    startTime: string | null; // iso-8601 (PT2H30M)
    duration: string | null; // iso-8601
    deadline: string | null; // iso datetime
    dependencies: string[] | null; // taskIds
    flexibility: number | null; // float [0-1]
    createdAt: string; // iso datetime
    updatedAt: string; // iso datetime
    finishedAt: string | null; // iso datetime
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
