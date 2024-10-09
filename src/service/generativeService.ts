import { apiService } from './apiService';
import { Task } from './taskService';

interface TaskUnravelContext {
    taskId: string;
    nTasks: number;
    additionalContext: string;
}

class GenerativeService {
    async unravel(context: TaskUnravelContext): Promise<Task[]> {
        return apiService.authenticatedPost(`/generate/unravel/task`, context);
    }
}

export const generativeService = new GenerativeService();
