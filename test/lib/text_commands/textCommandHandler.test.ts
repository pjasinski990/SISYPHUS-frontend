import { describe, it, expect, vi } from 'vitest';
import { TextCommandHandler } from 'src/lib/text_commands/textCommandHandler';
import { TextCommand, TriggerType } from 'src/lib/text_commands/textCommand';

describe('TextCommandHandler', () => {
    it('should match input with PREFIX trigger and call onMatch with matched text', () => {
        const onMatchMock = vi.fn();

        const command: TextCommand = {
            triggerType: TriggerType.PREFIX,
            prefix: '!',
            matchPattern: /hello/,
            onMatch: onMatchMock,
        };

        const handler = new TextCommandHandler([command]);

        handler.inputUpdated('!hello world !hello again');

        expect(onMatchMock).toHaveBeenCalledTimes(2);
        expect(onMatchMock).toHaveBeenCalledWith('!hello');
    });

    it('should match input with WRAPPER trigger and call onMatch with matched text', () => {
        const onMatchMock = vi.fn();

        const command: TextCommand = {
            triggerType: TriggerType.WRAPPER,
            wrapperStart: '[',
            wrapperEnd: ']',
            matchPattern: /command/,
            onMatch: onMatchMock,
        };

        const handler = new TextCommandHandler([command]);

        handler.inputUpdated('This is a [command] test. Another [command] here.');

        expect(onMatchMock).toHaveBeenCalledTimes(2);
        expect(onMatchMock).toHaveBeenCalledWith('[command]');
    });

    it('should match input with NULL_TRIGGER and call onMatch with matched text', () => {
        const onMatchMock = vi.fn();

        const command: TextCommand = {
            triggerType: TriggerType.NULL_TRIGGER,
            matchPattern: /matchme/,
            onMatch: onMatchMock,
        };

        const handler = new TextCommandHandler([command]);

        handler.inputUpdated('Please matchme in this text. matchme again.');

        expect(onMatchMock).toHaveBeenCalledTimes(2);
        expect(onMatchMock).toHaveBeenCalledWith('matchme');
    });

    it('should correctly escape special characters in prefix', () => {
        const onMatchMock = vi.fn();

        const command: TextCommand = {
            triggerType: TriggerType.PREFIX,
            prefix: '!*',
            matchPattern: /command/,
            onMatch: onMatchMock,
        };

        const handler = new TextCommandHandler([command]);

        handler.inputUpdated('!*command test');

        expect(onMatchMock).toHaveBeenCalledWith('!*command');
    });

    it('should correctly escape special characters in wrapper', () => {
        const onMatchMock = vi.fn();

        const command: TextCommand = {
            triggerType: TriggerType.WRAPPER,
            wrapperStart: '(*',
            wrapperEnd: '*)',
            matchPattern: /command/,
            onMatch: onMatchMock,
        };

        const handler = new TextCommandHandler([command]);

        handler.inputUpdated('This is a (*command*) test.');

        expect(onMatchMock).toHaveBeenCalledWith('(*command*)');
    });

    it('should handle multiple commands without interference', () => {
        const onMatchMock1 = vi.fn();
        const onMatchMock2 = vi.fn();

        const command1: TextCommand = {
            triggerType: TriggerType.PREFIX,
            prefix: '!',
            matchPattern: /hello/,
            onMatch: onMatchMock1,
        };

        const command2: TextCommand = {
            triggerType: TriggerType.PREFIX,
            prefix: '/',
            matchPattern: /hello/,
            onMatch: onMatchMock2,
        };

        const handler = new TextCommandHandler([command1, command2]);

        handler.inputUpdated('!hello and /hello');

        expect(onMatchMock1).toHaveBeenCalledWith('!hello');
        expect(onMatchMock2).toHaveBeenCalledWith('/hello');
    });

    it('should match multiple patterns with NULL_TRIGGER', () => {
        const onMatchMock = vi.fn();

        const command: TextCommand = {
            triggerType: TriggerType.NULL_TRIGGER,
            matchPattern: /matchme|findme/,
            onMatch: onMatchMock,
        };

        const handler = new TextCommandHandler([command]);

        handler.inputUpdated('Please matchme and findme in this text.');

        expect(onMatchMock).toHaveBeenCalledTimes(2);
        expect(onMatchMock).toHaveBeenCalledWith('matchme');
        expect(onMatchMock).toHaveBeenCalledWith('findme');
    });

    it('should return suggestions for PREFIX commands when input matches the start of the prefix', () => {
        const command: TextCommand = {
            triggerType: TriggerType.PREFIX,
            prefix: '!hello',
            matchPattern: /hello/,
            onMatch: vi.fn(),
        };

        const handler = new TextCommandHandler([command]);

        let suggestions = handler.getCommandSuggestions('!h');
        expect(suggestions).toContain('!hello');

        suggestions = handler.getCommandSuggestions('!hello');
        expect(suggestions).toContain('!hello');

        suggestions = handler.getCommandSuggestions('!x');
        expect(suggestions).not.toContain('!hello');
    });

    it('should return suggestions for WRAPPER commands when input matches the start of the wrapperStart', () => {
        const command: TextCommand = {
            triggerType: TriggerType.WRAPPER,
            wrapperStart: '[',
            wrapperEnd: ']',
            matchPattern: /command/,
            onMatch: vi.fn(),
        };

        const handler = new TextCommandHandler([command]);

        let suggestions = handler.getCommandSuggestions('[');
        expect(suggestions).toContain('[command]');

        suggestions = handler.getCommandSuggestions('[');
        expect(suggestions).toContain('[command]');

        suggestions = handler.getCommandSuggestions('{');
        expect(suggestions).not.toContain('[command]');
    });

    it('should return multiple suggestions when multiple commands match input', () => {
        const command1: TextCommand = {
            triggerType: TriggerType.PREFIX,
            prefix: '!hello',
            matchPattern: /hello/,
            onMatch: vi.fn(),
        };

        const command2: TextCommand = {
            triggerType: TriggerType.WRAPPER,
            wrapperStart: '[',
            wrapperEnd: ']',
            matchPattern: /help/,
            onMatch: vi.fn(),
        };

        const handler = new TextCommandHandler([command1, command2]);

        const suggestions = handler.getCommandSuggestions('[');

        expect(suggestions).toEqual(['[help]']);
    });

    it('should not return suggestions for NULL_TRIGGER commands', () => {
        const command: TextCommand = {
            triggerType: TriggerType.NULL_TRIGGER,
            matchPattern: /hello/,
            onMatch: vi.fn(),
        };

        const handler = new TextCommandHandler([command]);

        const suggestions = handler.getCommandSuggestions('h');

        expect(suggestions).toEqual([]);
    });

    it('should return suggestions from commands providing getSuggestions method', () => {
        const command: TextCommand = {
            triggerType: TriggerType.NULL_TRIGGER,
            matchPattern: /somepattern/,
            onMatch: vi.fn(),
            getSuggestions: (input: string) => {
                if (input === 'hel') {
                    return ['hello', 'help', 'helium'];
                }
                return [];
            },
        };

        const handler = new TextCommandHandler([command]);

        const suggestions = handler.getCommandSuggestions('hel');

        expect(suggestions).toEqual(['hello', 'help', 'helium']);
    });

    it('should prefer getSuggestions over default suggestions', () => {
        const command: TextCommand = {
            triggerType: TriggerType.PREFIX,
            prefix: '!hello',
            matchPattern: /hello/,
            onMatch: vi.fn(),
            getSuggestions: (input: string) => ['customSuggestion1', 'customSuggestion2'],
        };

        const handler = new TextCommandHandler([command]);

        const suggestions = handler.getCommandSuggestions('!he');

        expect(suggestions).toEqual(['customSuggestion1', 'customSuggestion2']);
    });

    it('should not call onMatch if there is no match', () => {
        const onMatchMock = vi.fn();

        const command: TextCommand = {
            triggerType: TriggerType.PREFIX,
            prefix: '!',
            matchPattern: /hello/,
            onMatch: onMatchMock,
        };

        const handler = new TextCommandHandler([command]);

        handler.inputUpdated('No matching command here.');

        expect(onMatchMock).not.toHaveBeenCalled();
    });

    it('should handle empty input gracefully', () => {
        const onMatchMock = vi.fn();

        const command: TextCommand = {
            triggerType: TriggerType.NULL_TRIGGER,
            matchPattern: /hello/,
            onMatch: onMatchMock,
        };

        const handler = new TextCommandHandler([command]);

        handler.inputUpdated('');

        expect(onMatchMock).not.toHaveBeenCalled();
    });

    it('should handle overlapping patterns correctly', () => {
        const onMatchMock1 = vi.fn();
        const onMatchMock2 = vi.fn();

        const command1: TextCommand = {
            triggerType: TriggerType.NULL_TRIGGER,
            matchPattern: /hello/,
            onMatch: onMatchMock1,
        };

        const command2: TextCommand = {
            triggerType: TriggerType.NULL_TRIGGER,
            matchPattern: /hell/,
            onMatch: onMatchMock2,
        };

        const handler = new TextCommandHandler([command1, command2]);

        handler.inputUpdated('hello');

        expect(onMatchMock1).toHaveBeenCalledWith('hello');
        expect(onMatchMock2).toHaveBeenCalledWith('hell');
    });
});
