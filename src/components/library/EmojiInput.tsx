import React, { forwardRef } from 'react';
import { Input, InputProps } from 'src/components/ui/input';
import { Textarea, TextareaProps } from 'src/components/ui/textarea';
import { useEnhancedInput } from 'src/components/hooks/useEnhancedInput';
import { TextCommand } from '../../lib/text_commands/textCommand';

interface BaseEmojiInputProps {
    value: string;
    onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    textCommands: TextCommand[];
    multiline?: boolean;
    onKeyDown?: (
        e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
}

type EmojiInputProps = BaseEmojiInputProps &
    (
        | (Omit<InputProps, 'onChange' | 'onKeyDown'> & {
              multiline?: false;
              ref?: React.Ref<HTMLInputElement>;
          })
        | (Omit<TextareaProps, 'onChange' | 'onKeyDown'> & {
              multiline: true;
              ref?: React.Ref<HTMLTextAreaElement>;
          })
    );

export const EmojiInput = forwardRef<
    HTMLInputElement | HTMLTextAreaElement,
    EmojiInputProps
>((props, ref) => {
    const {
        multiline = false,
        value,
        onChange,
        textCommands,
        onKeyDown,
        ...restProps
    } = props;

    const inputRef = ref as React.RefObject<
        HTMLInputElement | HTMLTextAreaElement
    >;

    const {
        text,
        handleInputChange,
        handleKeyDown: enhancedHandleKeyDown,
        showSuggestions,
        filteredEmojis,
        selectedIndex,
        handleEmojiSelect,
        listItemRefs,
    } = useEnhancedInput<HTMLInputElement | HTMLTextAreaElement>({
        value,
        onChange,
        name: restProps.name,
        inputRef,
        textCommands,
        onKeyDown,
    });

    return (
        <div className="relative">
            {multiline ? (
                <Textarea
                    {...(restProps as TextareaProps)}
                    ref={inputRef as React.Ref<HTMLTextAreaElement>}
                    value={text}
                    onChange={handleInputChange}
                    onKeyDown={
                        enhancedHandleKeyDown as React.KeyboardEventHandler<HTMLTextAreaElement>
                    }
                    className="w-full"
                />
            ) : (
                <Input
                    {...(restProps as InputProps)}
                    ref={inputRef as React.Ref<HTMLInputElement>}
                    value={text}
                    onChange={handleInputChange}
                    onKeyDown={
                        enhancedHandleKeyDown as React.KeyboardEventHandler<HTMLInputElement>
                    }
                    className="w-full"
                />
            )}
            {showSuggestions && filteredEmojis.length > 0 && (
                <ul
                    className="
            rounded-md
            shadow-md
            border
            absolute
            left-0
            top-[105%]
            list-none
            w-full
            max-h-48
            overflow-y-auto
            z-[1000]
          "
                >
                    {filteredEmojis.map((emoji, index) => (
                        <li
                            key={emoji.id}
                            ref={el => (listItemRefs.current[index] = el)}
                            className={`p-2 cursor-pointer ease-in-out ${
                                index === selectedIndex
                                    ? 'bg-slate-200 dark:bg-slate-950'
                                    : 'bg-slate-50 dark:bg-slate-900'
                            } hover:bg-slate-300 dark:hover:bg-slate-600`}
                            onMouseDown={() => handleEmojiSelect(emoji)}
                        >
                            {emoji.skins[0].native} :{emoji.id}:
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
});

EmojiInput.displayName = 'EmojiInput';
