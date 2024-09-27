import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Input, InputProps } from 'src/components/ui/input';
import Fuse from 'fuse.js';
import { Emoji } from "@emoji-mart/data";
import { fetchEmojis } from "src/lib/emojiData";

interface EmojiInputProps extends InputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EmojiInput: React.FC<EmojiInputProps> = ({ value, onChange, ...props }) => {
    const [text, setText] = useState(value || '');
    const [filteredEmojis, setFilteredEmojis] = useState<Emoji[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [direction, setDirection] = useState<'up' | 'down'>('down');
    const inputRef = useRef<HTMLInputElement>(null);
    const [emojiList, setEmojiList] = useState<Emoji[]>([]);
    const fuse = useRef<Fuse<Emoji> | null>(null);

    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const listItemRefs = useRef<(HTMLLIElement | null)[]>([]);

    useEffect(() => {
        setText(value || '');
    }, [value]);

    useEffect(() => {
        fetchEmojis().then((res) => {
            setEmojiList(res);
        });
    }, []);

    useEffect(() => {
        if (emojiList.length > 0) {
            fuse.current = new Fuse(emojiList, {
                keys: ['id', 'name', 'keywords'],
                threshold: 0.3,
            });
        }
    }, [emojiList]);

    useEffect(() => {
        const forwardScroll = 2;
        if (selectedIndex >= 0 && listItemRefs.current[selectedIndex]) {
            const nItems = listItemRefs.current.length
            let scrollIndex = selectedIndex;
            if (selectedIndex < forwardScroll || selectedIndex > nItems - forwardScroll - 1) {
                scrollIndex = selectedIndex
            } else if (direction === 'down') {
                scrollIndex = (selectedIndex + forwardScroll) % nItems;
            } else if (direction === 'up') {
                scrollIndex = (selectedIndex - forwardScroll) % nItems;
            }
            listItemRefs.current[scrollIndex]?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }, [direction, selectedIndex]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newText = e.target.value;
        setText(newText);

        const cursorPosition = e.target.selectionStart || 0;
        const textUpToCursor = newText.slice(0, cursorPosition);

        const match = textUpToCursor.match(/:([a-zA-Z0-9_+-]*)$/);
        if (match) {
            const query = match[1];
            if (query.length > 0 && fuse.current) {
                const results = fuse.current.search(query);
                const emojis = results.slice(0, 12).map((result) => result.item);
                setFilteredEmojis(emojis);
                setShowSuggestions(emojis.length > 0);
                setSelectedIndex(emojis.length > 0 ? 0 : -1);
            } else {
                setShowSuggestions(false);
                setSelectedIndex(-1);
            }
        } else {
            setShowSuggestions(false);
            setSelectedIndex(-1);
        }

        if (newText[cursorPosition - 1] === ':') {
            const fullText = newText;
            const upToCursor = fullText.slice(0, cursorPosition);
            const replaceMatch = upToCursor.match(/:([a-zA-Z0-9_\+-]+):$/);
            if (replaceMatch) {
                const code = replaceMatch[1];
                const emoji = emojiList.find(
                    (e) => e.id === code || e.name.toLowerCase() === code.toLowerCase()
                );
                if (emoji) {
                    const beforeMatch = upToCursor.slice(0, replaceMatch.index);
                    const afterMatch = fullText.slice(cursorPosition);
                    const newTextUpToMatch = beforeMatch + emoji.skins[0].native;
                    const updatedText = newTextUpToMatch + afterMatch;

                    setText(updatedText);
                    setShowSuggestions(false);
                    setSelectedIndex(-1);

                    const newCursorPosition = newTextUpToMatch.length;
                    setTimeout(() => {
                        if (inputRef.current) {
                            inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
                            inputRef.current.focus();
                        }
                    }, 0);

                    const syntheticEvent = {
                        target: {
                            value: updatedText,
                            name: props.name,
                        },
                    } as unknown as React.ChangeEvent<HTMLInputElement>;

                    onChange(syntheticEvent);

                    return;
                }
            }
        }

        onChange(e);
    };

    const handleEmojiSelect = (emoji: Emoji) => {
        const cursorPosition = inputRef.current?.selectionStart || text.length;
        const textUpToCursor = text.slice(0, cursorPosition);
        const textAfterCursor = text.slice(cursorPosition);

        const newTextUpToCursor = textUpToCursor.replace(/:([a-zA-Z0-9_+-]*)$/, emoji.skins[0].native);
        const newText = newTextUpToCursor + textAfterCursor;

        setText(newText);
        setShowSuggestions(false);
        setSelectedIndex(-1);

        const newCursorPosition = newTextUpToCursor.length;
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
                inputRef.current.focus();
            }
        }, 0);

        const syntheticEvent = {
            target: {
                value: newText,
                name: props.name,
            },
        } as unknown as React.ChangeEvent<HTMLInputElement>;

        onChange(syntheticEvent);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (showSuggestions && filteredEmojis.length > 0) {
            let handled = false;
            const isCtrlHeld = e.ctrlKey;
            const isDown = (isCtrlHeld && e.key === 'j') || e.key === 'ArrowDown';
            const isUp = (isCtrlHeld && e.key === 'k') || e.key === 'ArrowUp';
            if (isDown) {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % filteredEmojis.length);
                setDirection('down')
                handled = true;
            } else if (isUp) {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + filteredEmojis.length) % filteredEmojis.length);
                setDirection('up')
                handled = true;
            }

            if (handled) {
                return;
            }

            if (e.key === 'Enter') {
                if (selectedIndex >= 0 && selectedIndex < filteredEmojis.length) {
                    e.preventDefault();
                    handleEmojiSelect(filteredEmojis[selectedIndex]);
                }
            }
        }

        if (props.onKeyDown) {
            props.onKeyDown(e);
        }
    };

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
                            ref={(el) => (listItemRefs.current[index] = el)}
                            className={` p-2 cursor-pointer ease-in-out ${index === selectedIndex
                                ? 'bg-slate-200 dark:bg-slate-950'
                                : 'bg-slate-50 dark:bg-slate-900'}
                            hover:bg-slate-300 dark:hover:bg-slate-600
                        `}
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
