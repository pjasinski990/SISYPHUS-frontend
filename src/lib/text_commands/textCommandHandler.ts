import { TextCommand, TriggerType } from './textCommand';

export class TextCommandHandler {
    private readonly commands: TextCommand[];
    private readonly compiledPatterns: {
        command: TextCommand;
        pattern: RegExp;
    }[];

    constructor(commands: TextCommand[]) {
        this.commands = commands;
        this.compiledPatterns = [];
        this.preprocessCommands();
    }

    private preprocessCommands(): void {
        for (const command of this.commands) {
            let pattern: RegExp;

            switch (command.triggerType) {
                case TriggerType.PREFIX:
                    pattern = new RegExp(
                        command.prefix!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
                            command.matchPattern.source,
                        'gi'
                    );
                    break;

                case TriggerType.WRAPPER: {
                    const wrapperStartEscaped = command.wrapperStart!.replace(
                        /[.*+?^${}()|[\]\\]/g,
                        '\\$&'
                    );
                    const wrapperEndEscaped = command.wrapperEnd!.replace(
                        /[.*+?^${}()|[\]\\]/g,
                        '\\$&'
                    );
                    pattern = new RegExp(
                        wrapperStartEscaped +
                            command.matchPattern.source +
                            wrapperEndEscaped,
                        'gi'
                    );
                    break;
                }

                case TriggerType.NULL_TRIGGER:
                    pattern = new RegExp(command.matchPattern.source, 'gi');
                    break;

                default:
                    continue;
            }

            this.compiledPatterns.push({ command, pattern });
        }
    }

    onInputUpdated(input: string): string {
        let updatedInput = input;
        for (const { command, pattern } of this.compiledPatterns) {
            let match: RegExpExecArray | null;

            pattern.lastIndex = 0;

            const ignoreEscapedCommandPattern = new RegExp(
                `(?<!\\\\)${pattern.source}`,
                pattern.flags
            );
            while (
                (match = ignoreEscapedCommandPattern.exec(updatedInput)) !==
                null
            ) {
                command.onMatch(match[0]);

                if (command.removeCommandOnMatch) {
                    updatedInput =
                        updatedInput.slice(0, match.index) +
                        updatedInput.slice(match.index + match[0].length);
                    ignoreEscapedCommandPattern.lastIndex = match.index;
                }
            }
        }
        return updatedInput;
    }

    getCommandSuggestions(input: string): string[] {
        const suggestions: string[] = [];

        for (const command of this.commands) {
            if (command.getSuggestions) {
                suggestions.push(...command.getSuggestions(input));
            } else {
                suggestions.push(
                    ...this.generateCommandSuggestions(command, input)
                );
            }
        }
        return suggestions;
    }

    private generateCommandSuggestions(
        command: TextCommand,
        input: string
    ): string[] {
        switch (command.triggerType) {
            case TriggerType.NULL_TRIGGER:
                return [];
            case TriggerType.PREFIX:
                return this.generatePrefixCommandSuggestions(command, input);
            case TriggerType.WRAPPER:
                return this.generateWrapperCommandSuggestions(command, input);
        }
    }

    private generatePrefixCommandSuggestions(
        command: TextCommand,
        input: string
    ): string[] {
        if (command.prefix && command.prefix.startsWith(input)) {
            return [command.prefix];
        }
        return [];
    }

    private generateWrapperCommandSuggestions(
        command: TextCommand,
        input: string
    ): string[] {
        if (command.wrapperStart && command.wrapperStart.startsWith(input)) {
            return [
                command.wrapperStart +
                    command.matchPattern.source +
                    command.wrapperEnd,
            ];
        }
        return [];
    }
}
