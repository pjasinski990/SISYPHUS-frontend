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

export function prettyDurationFromIsoTime(duration: string): string {
    const regex =
        /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/;

    const matches = duration.match(regex);

    if (!matches) {
        throw new Error('Invalid ISO 8601 duration format');
    }

    const [, years, months, weeks, days, hours, minutes, seconds] = matches.map(
        v => (v ? parseInt(v, 10) : 0)
    );

    const parts: string[] = [];

    if (years) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
    if (months) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
    if (weeks) parts.push(`${weeks} week${weeks !== 1 ? 's' : ''}`);
    if (days) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    if (hours) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    if (minutes) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
    if (seconds) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);

    if (parts.length === 0) {
        return '0 seconds';
    }
    return parts.join(', ').replace(/,([^,]*)$/, ' and$1');
}
