import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import Fuse from 'fuse.js';
import { Emoji } from '@emoji-mart/data';
import { fetchEmojis } from 'src/lib/emojiData';

interface UseEmojiPickerProps<
    T extends HTMLInputElement | HTMLTextAreaElement,
> {
    value: string;
    onChange: (e: React.ChangeEvent<T>) => void;
    name?: string;
    inputRef: React.RefObject<T>;
    onKeyDown?: (e: KeyboardEvent<T>) => void;
}

export function useEmojiPicker<
    T extends HTMLInputElement | HTMLTextAreaElement,
>(props: UseEmojiPickerProps<T>) {
    const { value, onChange, name, inputRef, onKeyDown } = props;

    const [text, setText] = useState(value || '');
    const [filteredEmojis, setFilteredEmojis] = useState<Emoji[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [direction, setDirection] = useState<'up' | 'down'>('down');
    const [emojiList, setEmojiList] = useState<Emoji[]>([]);
    const fuse = useRef<Fuse<Emoji> | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const listItemRefs = useRef<(HTMLLIElement | null)[]>([]);
    const N_EMOJIS_PROPOSED = 32;

    useEffect(() => {
        setText(value || '');
    }, [value]);

    useEffect(() => {
        fetchEmojis().then(res => {
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
            const nItems = listItemRefs.current.length;
            let scrollIndex = selectedIndex;
            if (
                selectedIndex < forwardScroll ||
                selectedIndex > nItems - forwardScroll - 1
            ) {
                scrollIndex = selectedIndex;
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

    const handleInputChange = (e: React.ChangeEvent<T>) => {
        const newText = e.target.value;
        setText(newText);

        const cursorPosition = e.target.selectionStart || 0;
        const textUpToCursor = newText.slice(0, cursorPosition);

        const match = textUpToCursor.match(/:([a-zA-Z0-9_+-]*)$/);
        if (match) {
            const query = match[1];
            if (query.length > 0 && fuse.current) {
                const results = fuse.current.search(query);
                const emojis = results
                    .slice(0, N_EMOJIS_PROPOSED)
                    .map(result => result.item);
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
            const replaceMatch = upToCursor.match(/:([a-zA-Z0-9_+-]+):$/);
            if (replaceMatch) {
                const code = replaceMatch[1];
                const emoji = emojiList.find(
                    e =>
                        e.id === code ||
                        e.name.toLowerCase() === code.toLowerCase()
                );
                if (emoji) {
                    const beforeMatch = upToCursor.slice(0, replaceMatch.index);
                    const afterMatch = fullText.slice(cursorPosition);
                    const newTextUpToMatch =
                        beforeMatch + emoji.skins[0].native;
                    const updatedText = newTextUpToMatch + afterMatch;

                    setText(updatedText);
                    setShowSuggestions(false);
                    setSelectedIndex(-1);

                    const newCursorPosition = newTextUpToMatch.length;
                    setTimeout(() => {
                        if (inputRef.current) {
                            inputRef.current.setSelectionRange(
                                newCursorPosition,
                                newCursorPosition
                            );
                            inputRef.current.focus();
                        }
                    }, 0);

                    const syntheticEvent = {
                        target: {
                            value: updatedText,
                            name: name,
                        },
                    } as unknown as React.ChangeEvent<T>;

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

        const newTextUpToCursor = textUpToCursor.replace(
            /:([a-zA-Z0-9_+-]*)$/,
            emoji.skins[0].native
        );
        const newText = newTextUpToCursor + textAfterCursor;

        setText(newText);
        setShowSuggestions(false);
        setSelectedIndex(-1);

        const newCursorPosition = newTextUpToCursor.length;
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.setSelectionRange(
                    newCursorPosition,
                    newCursorPosition
                );
                inputRef.current.focus();
            }
        }, 0);

        const syntheticEvent = {
            target: {
                value: newText,
                name: name,
            },
        } as unknown as React.ChangeEvent<T>;

        onChange(syntheticEvent);
    };

    const handleKeyDown = (e: KeyboardEvent<T>) => {
        if (showSuggestions && filteredEmojis.length > 0) {
            let handled = false;
            const isCtrlHeld = e.ctrlKey;
            const isDown =
                (isCtrlHeld && e.key === 'j') || e.key === 'ArrowDown';
            const isUp = (isCtrlHeld && e.key === 'k') || e.key === 'ArrowUp';
            if (isDown) {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredEmojis.length);
                setDirection('down');
                handled = true;
            } else if (isUp) {
                e.preventDefault();
                setSelectedIndex(
                    prev =>
                        (prev - 1 + filteredEmojis.length) %
                        filteredEmojis.length
                );
                setDirection('up');
                handled = true;
            }

            if (handled) {
                return;
            }

            if (e.key === 'Enter') {
                if (
                    selectedIndex >= 0 &&
                    selectedIndex < filteredEmojis.length
                ) {
                    e.preventDefault();
                    handleEmojiSelect(filteredEmojis[selectedIndex]);
                }
            }
        }

        if (onKeyDown) {
            onKeyDown(e);
        }
    };

    return {
        text,
        handleInputChange,
        handleKeyDown,
        showSuggestions,
        filteredEmojis,
        selectedIndex,
        handleEmojiSelect,
        listItemRefs,
    };
}
