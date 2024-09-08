import { apiService } from "./apiService";
import { Task } from "./taskService";

export interface DailyPlan {
    id: string,
    ownerUsername: string,
    day: string,    // iso date (yyyy-MM-dd)
    todo: Task[],
    done: Task[],
}

export interface GetDailyPlanResponse {
    plan: DailyPlan;
}

class DailyPlanService {
    async updateDailyPlan(dailyPlan: DailyPlan): Promise<any> {
        return apiService.authenticatedPut(`/daily-plan/${dailyPlan.day}`, dailyPlan);
    }

    async getDailyPlan(date: string): Promise<GetDailyPlanResponse> {
        return apiService.authenticatedGet(`/daily-plan/${date}`);
    }
}

export const dailyPlanService = new DailyPlanService()
