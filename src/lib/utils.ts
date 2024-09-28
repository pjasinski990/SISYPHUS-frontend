import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatToIsoDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

export function getTimestamp(dateString: string): number {
    return new Date(dateString).getTime();
}

export function happenedToday(dateTime?: Date) {
    if (!dateTime) {
        return false;
    }
    return formatToIsoDate(new Date()) === formatToIsoDate(dateTime);
}
