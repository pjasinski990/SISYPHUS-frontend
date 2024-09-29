import { apiService } from './apiService';
import { TaskCategory, TaskSize } from './taskService';

export interface StatsResponse {
    id: string | null;
    date: string;
    ownerUsername: string;
    category: TaskCategory;
    size: TaskSize;
    count: number;
}

class StatsService {
    async getStatsForDay(day: string): Promise<StatsResponse[]> {
        return apiService.authenticatedGet(`/api/task-statistics/date`, {
            params: day,
        });
    }

    async getStatsForDateRange(
        startDate: string,
        endDate: string
    ): Promise<StatsResponse[]> {
        return apiService.authenticatedGet(`/api/task-statistics/between`, {
            params: { startDate, endDate },
        });
    }
}

export const statsService = new StatsService();
