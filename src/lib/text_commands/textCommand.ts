export enum TriggerType {
    PREFIX = 'prefix',
    WRAPPER = 'wrapper',
    NULL_TRIGGER = 'null_trigger',
}

export interface TextCommand {
    triggerType: TriggerType;
    matchPattern: RegExp;
    onMatch: (match: string) => void;
    prefix?: string;
    wrapperStart?: string;
    wrapperEnd?: string;
    getSuggestions?: (input: string) => string[];
    removeCommandOnMatch?: boolean;
}
