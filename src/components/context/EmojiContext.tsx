import React, { createContext, KeyboardEvent, useContext, useEffect, useRef, useState } from 'react';
import Fuse from 'fuse.js';
import { Emoji } from "@emoji-mart/data";
import { fetchEmojis } from "src/lib/emojiData";

interface EmojiContextType {
    text: string;
    setText: (text: string) => void;
    filteredEmojis: Emoji[];
    showSuggestions: boolean;
    selectedIndex: number;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleEmojiSelect: (emoji: Emoji) => void;
    handleKeyDown: (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => boolean;
    inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
    listItemRefs: React.MutableRefObject<(HTMLLIElement | null)[]>;
}

const EmojiContext = createContext<EmojiContextType | undefined>(undefined);

interface EmojiProviderProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    children: React.ReactNode;
}

export const EmojiProvider: React.FC<EmojiProviderProps> = ({ value, onChange, children }) => {
    const [text, setText] = useState(value || '');
    const [filteredEmojis, setFilteredEmojis] = useState<Emoji[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [direction, setDirection] = useState<'up' | 'down'>('down');
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
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
            const nItems = listItemRefs.current.length;
            let scrollIndex = selectedIndex;
            if (selectedIndex < forwardScroll || selectedIndex > nItems - forwardScroll - 1) {
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
                            name: e.target.name,
                        },
                    } as unknown as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

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
                name: inputRef.current?.name,
            },
        } as unknown as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

        onChange(syntheticEvent);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>): boolean => {
        if (showSuggestions && filteredEmojis.length > 0) {
            let handled = false;
            const isCtrlHeld = e.ctrlKey;
            const isDown = (isCtrlHeld && e.key === 'j') || e.key === 'ArrowDown';
            const isUp = (isCtrlHeld && e.key === 'k') || e.key === 'ArrowUp';

            if (isDown) {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % filteredEmojis.length);
                setDirection('down');
                handled = true;
            } else if (isUp) {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + filteredEmojis.length) % filteredEmojis.length);
                setDirection('up');
                handled = true;
            } else if (e.key === 'Enter') {
                if (selectedIndex >= 0 && selectedIndex < filteredEmojis.length) {
                    e.preventDefault();
                    handleEmojiSelect(filteredEmojis[selectedIndex]);
                    handled = true;
                }
            }
            return handled;
        }
        return false;
    };

    const contextValue: EmojiContextType = {
        text,
        setText,
        filteredEmojis,
        showSuggestions,
        selectedIndex,
        handleInputChange,
        handleEmojiSelect,
        handleKeyDown,
        inputRef,
        listItemRefs,
    };

    return (
        <EmojiContext.Provider value={contextValue}>
            {children}
        </EmojiContext.Provider>
    );
};

export const useEmoji = () => {
    const context = useContext(EmojiContext);
    if (!context) {
        throw new Error('useEmoji must be used within an EmojiProvider');
    }
    return context;
};
