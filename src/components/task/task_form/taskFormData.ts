import { Task, TaskCategory, TaskSize } from '../../../service/taskService';
import {
    extractHoursFromIsoTime,
    extractMinutesFromIsoTime,
} from '../../../lib/utils';

export class TaskFormData {
    title: string;
    category: TaskCategory;
    size: TaskSize;
    listName: string;
    description: string | null;
    startTime: string | null;
    duration: string | null;
    deadline: string | null;
    dependencies: string[] | null;
    flexibility: number | null;
    durationHours: number | null;
    durationMinutes: number | null;
    hasDeadline: boolean;
    tags: string[] | null;

    constructor(data: Partial<TaskFormData>) {
        this.title = data.title || '';
        this.category = data.category || TaskCategory.WHITE;
        this.size = data.size || TaskSize.SMALL;
        this.listName = data.listName || '';
        this.description = data.description ?? null;
        this.startTime = data.startTime ?? null;
        this.duration = data.duration ?? null;
        this.deadline = data.deadline ?? null;
        this.dependencies = data.dependencies ?? null;
        this.flexibility = data.flexibility ?? null;
        this.durationHours = data.durationHours ?? null;
        this.durationMinutes = data.durationMinutes ?? null;
        this.hasDeadline = !!data.deadline;
        this.tags = data.tags ?? null;
    }

    static fromTask(initialData: Task): TaskFormData {
        return new TaskFormData({
            title: initialData.title,
            description: initialData.description,
            category: initialData.category,
            size: initialData.size,
            listName: initialData.listName,
            duration: initialData.duration,
            durationHours: extractHoursFromIsoTime(initialData.duration),
            durationMinutes: extractMinutesFromIsoTime(initialData.duration),
            startTime: initialData.startTime,
            deadline: initialData.deadline,
            dependencies: initialData.dependencies || [],
            flexibility: initialData.flexibility ?? 0.1,
            hasDeadline: !!initialData.deadline,
            tags: initialData.tags || [],
        });
    }
}
