import { TaskList } from 'src/lib/taskList';

export const getNextList = (
    current: TaskList | null,
    lists: TaskList[]
): TaskList | null => {
    if (!current) {
        return firstOrNull(lists);
    }

    const currentIndex = lists.indexOf(current);
    if (currentIndex === -1 || currentIndex >= lists.length - 1) {
        return null;
    }
    return lists[currentIndex + 1];
};

export const getPrevList = (
    current: TaskList | null,
    lists: TaskList[]
): TaskList | null => {
    if (!current) {
        return lastOrNull(lists);
    }
    const currentIndex = lists.indexOf(current);
    if (currentIndex <= 0) {
        return null;
    }
    return lists[currentIndex - 1];
};

export const getNextNonEmptyList = (
    current: TaskList | null,
    lists: TaskList[]
): TaskList | null => {
    let following: TaskList[] = lists;
    if (current) {
        const currentIndex = lists.indexOf(current);
        following = lists.slice(currentIndex + 1);
    }
    const followingNonEmpty = following.filter(list => list.tasks.length > 0);

    return getNextList(null, followingNonEmpty);
};

export const getPrevNonEmptyList = (
    current: TaskList | null,
    lists: TaskList[]
): TaskList | null => {
    let previous: TaskList[] = lists;
    if (current) {
        const currentIndex = lists.indexOf(current);
        previous = lists.slice(0, currentIndex);
    }
    const previousNonEmpty = previous.filter(list => list.tasks.length > 0);

    return getPrevList(null, previousNonEmpty);
};

function firstOrNull(arr: TaskList[]): TaskList | null {
    return arr.length > 0 ? arr[0] : null;
}

function lastOrNull(arr: TaskList[]): TaskList | null {
    return arr.length > 0 ? arr[arr.length - 1] : null;
}

export function getOrNull<T>(
    key: string | null,
    available: Record<string, T>
): T | null {
    return key && available[key] ? available[key] : null;
}
