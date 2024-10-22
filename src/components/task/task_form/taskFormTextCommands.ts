import {
    UseFormGetValues,
    UseFormSetValue,
} from 'react-hook-form/dist/types/form';
import { TaskCategory, TaskSize } from '../../../service/taskService';
import { escapeRegex, stringToEnum } from '../../../lib/utils';
import {
    TextCommand,
    TriggerType,
} from '../../../lib/text_commands/textCommand';
import { TaskFormData } from './taskFormData';

export function buildTaskFormTextCommands(
    getValues: UseFormGetValues<TaskFormData>,
    setValue: UseFormSetValue<TaskFormData>,
    availableTags: string[]
) {
    const sizeCommand: TextCommand = {
        triggerType: TriggerType.PREFIX,
        prefix: '/',
        matchPattern: getRegexMatcherForEnum(TaskSize),
        onMatch: match => {
            const matchStr = match.slice(1).toUpperCase().trim();
            const enumVal = stringToEnum(matchStr, TaskSize);
            if (enumVal) {
                setValue('size', enumVal);
            }
        },
        removeCommandOnMatch: true,
    };

    const categoryCommand: TextCommand = {
        triggerType: TriggerType.PREFIX,
        prefix: '/',
        matchPattern: getRegexMatcherForEnum(TaskCategory),
        onMatch: match => {
            const matchStr = match.slice(1).toUpperCase().trim();
            const enumVal = stringToEnum(matchStr, TaskCategory);
            if (enumVal) {
                setValue('category', enumVal);
            }
        },
        removeCommandOnMatch: true,
    };

    const durationCommand: TextCommand = {
        triggerType: TriggerType.PREFIX,
        prefix: '/',
        matchPattern: /(?:d|duration)\s*(?:(\d+)h)?(?:(\d+)m)?\s/i,
        onMatch: match => {
            const matchString = match.trim();
            const hoursMatch = matchString.match(/(\d+)h/);
            const minutesMatch = matchString.match(/(\d+)m/);
            const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
            const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

            setValue('durationMinutes', minutes);
            setValue('durationHours', hours);
        },
        removeCommandOnMatch: true,
    };

    const flexibilityCommand: TextCommand = {
        triggerType: TriggerType.PREFIX,
        prefix: '/',
        matchPattern: /(?:f|flex|flexibility)\s*(?:1|0?\.\d+)\s/i,
        onMatch: match => {
            const matchString = match.trim();
            const flexibilityMatch = matchString.match(/(1|(0?\.\d+))/);
            const flexibility = flexibilityMatch
                ? parseFloat(flexibilityMatch[1])
                : 0;

            setValue('flexibility', flexibility);
        },
        removeCommandOnMatch: true,
    };

    const startTimeCommand: TextCommand = {
        triggerType: TriggerType.PREFIX,
        prefix: '/',
        matchPattern: /(?:s|start)\s*(\d{1,2}):(\d{1,2})\s/i,
        onMatch: match => {
            const startTime = toTimeInput(match.trim());
            setValue('startTime', startTime);
        },
        removeCommandOnMatch: true,
    };

    const createTagCommand: TextCommand = {
        triggerType: TriggerType.PREFIX,
        prefix: '#',
        matchPattern: /[a-zA-Z_\-:]+\s$/i,
        onMatch: match => {
            const values = getValues('tags') ?? [];
            const cleanTag = match.trim().slice(1);
            setValue('tags', [...values, cleanTag]);
        },
        removeCommandOnMatch: true,
        getSuggestions: (input: string) => {
            const cleanInput = input.trim().slice(1);
            console.log(
                `recommending: ${availableTags.filter(t => t.startsWith(cleanInput))}`
            );
            return availableTags.filter(tag => tag.startsWith(cleanInput));
        },
    };

    return [
        sizeCommand,
        categoryCommand,
        durationCommand,
        flexibilityCommand,
        startTimeCommand,
        createTagCommand,
    ];
}

function getRegexMatcherForEnum<T extends Record<string, string | number>>(
    enumObj: T
) {
    const enumValues = Object.values(enumObj);
    const stringValues = enumValues.map(e => e.toString().toLowerCase());
    const escapedValues = stringValues.map(s => escapeRegex(s));
    return new RegExp(`(${escapedValues.join('|')})\\s`, 'i');
}

function toTimeInput(time: string): string {
    const match = time.match(/(?:s|start)\s+(\d{1,2}):(\d{1,2})\s*/);
    if (!match) {
        return '00:00';
    }

    const [, rawHours, rawMinutes] = match;
    const hours = parseInt(rawHours, 10);
    const minutes = parseInt(rawMinutes, 10);

    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        const paddedHours = String(hours).padStart(2, '0');
        const paddedMinutes = String(minutes).padStart(2, '0');
        return `${paddedHours}:${paddedMinutes}`;
    } else {
        return '00:00';
    }
}
