import { PersistenceProvider } from './PersistenceProvider';
import { Task, taskService } from '../service/taskService';
import { TaskList } from '../lib/taskList';

class MongoPersistenceProvider implements PersistenceProvider {
    updateTask(task: Task): Promise<Task> {
        return taskService.updateTask(task);
    }

    createTask(task: Task): Promise<Task> {
        return taskService.createTask(task);
    }

    deleteTask(taskId: string): Promise<Task> {
        return taskService.deleteTask(taskId);
    }

    fetchTaskList(listName: string): Promise<TaskList | null> {
        return taskService.getTaskList(listName);
    }
}

export const mongoPersistenceProvider = new MongoPersistenceProvider();
