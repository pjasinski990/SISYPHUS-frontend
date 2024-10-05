import { Task } from '../service/taskService';

export interface TaskList {
    name: string;
    tasks: Task[];
    displayOrder: number;
}
