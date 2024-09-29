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

export function hexToRgba(hex: string, alpha: number): string {
    const bigint = parseInt(hex.replace('#', ''), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
