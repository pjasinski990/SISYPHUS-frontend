import React, { useRef } from 'react';
import { Input, InputProps } from 'src/components/ui/input';
import { useEmojiPicker } from 'src/components/hooks/useEmojiPicker';

interface EmojiInputProps extends InputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EmojiInput: React.FC<EmojiInputProps> = ({
    value,
    onChange,
    ...props
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const {
        text,
        handleInputChange,
        handleKeyDown,
        showSuggestions,
        filteredEmojis,
        selectedIndex,
        handleEmojiSelect,
        listItemRefs,
    } = useEmojiPicker({
        value,
        onChange,
        name: props.name,
        inputRef,
    });

    return (
        <div className="relative">
            <Input
                {...props}
                ref={inputRef}
                value={text}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="w-full"
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
            max-h-[200px]
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
};
