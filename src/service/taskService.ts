import { apiService } from "./api";

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
    description: string,
    startTime: string,
}

export class DailyPlanService {
    async getDailyPlan(date: string): Promise<any> {
        return apiService.authenticatedGet(`/daily-plan/${date}`);
    }

    static formatToIsoDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }
}

export const dailyPlanService = new DailyPlanService()
