import { apiService } from "src/lib/api";

export async function getDailyPlan(date: string): Promise<any> {
    return apiService.authenticatedGet(`/daily-plan/${date}`);
}

export function formatToIsoDate(date: Date): string {
    return date.toISOString().split('T')[0];
}
