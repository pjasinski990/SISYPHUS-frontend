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
    id: string,
    ownerUsername: string,
    category: TaskCategory,
    size: TaskSize,
    title: string,
    description: string,
    startTime: string,
}

export class TaskService {
}

export const dailyPlanService = new TaskService()
