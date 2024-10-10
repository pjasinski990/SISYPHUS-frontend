import React, { forwardRef } from 'react';
import { Textarea, TextareaProps } from 'src/components/ui/textarea';
import { useEmojiPicker } from 'src/components/hooks/useEmojiPicker';
import MarkdownRenderer from 'src/components/markdown/MarkdownRenderer';

interface EmojiTextareaProps extends TextareaProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const EmojiTextarea = forwardRef<HTMLTextAreaElement, EmojiTextareaProps>(
    ({ value, onChange, ...props }, ref) => {
        const {
            text,
            handleInputChange,
            handleKeyDown,
            showSuggestions,
            filteredEmojis,
            selectedIndex,
            handleEmojiSelect,
            listItemRefs,
        } = useEmojiPicker<HTMLTextAreaElement>({
            value,
            onChange,
            name: props.name,
            inputRef: ref as React.RefObject<HTMLTextAreaElement>,
            onKeyDown: props.onKeyDown,
        });

        return (
            <div className="relative flex flex-row w-full items-stretch space-x-2">
                <div className="flex-1 relative">
                    <Textarea
                        {...props}
                        ref={ref}
                        value={text}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        className="max-h-48 h-full overflow-auto"
                    />
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
                                    ref={(el) => (listItemRefs.current[index] = el)}
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
                <div
                    className={`flex-1 bg-slate-200 dark:bg-slate-900 rounded-lg max-h-48 overflow-auto ${
                        text.length === 0 ? 'flex items-center justify-center' : ''
                    }`}
                >
                    {text.length === 0 ? (
                        <small className="text-slate-500 dark:text-slate-400 font-mono text-center">
                            description preview
                        </small>
                    ) : (
                        <MarkdownRenderer content={text} />
                    )}
                </div>
            </div>
        );
    }
);

EmojiTextarea.displayName = 'EmojiTextarea';
