import { Task } from '../service/taskService';
import { TaskList } from '../lib/taskList';

export interface PersistenceProvider {
    createTask: (task: Task) => Promise<Task>;
    updateTask: (task: Task) => Promise<Task | null>;
    deleteTask: (taskId: string) => Promise<Task | null>;
    fetchTaskList: (listName: string) => Promise<TaskList | null>;
}
