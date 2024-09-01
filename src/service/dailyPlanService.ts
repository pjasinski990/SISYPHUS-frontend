import { apiService } from "./apiService";
import { Task } from "./taskService";

export interface DailyPlan {
    id: string,
    ownerUsername: string,
    day: string,    // iso date (yyyy-MM-dd)
    todo: Task[],
    done: Task[],
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
