import { Emoji, EmojiMartData } from '@emoji-mart/data';

const getEmojiData = async (): Promise<EmojiMartData> => {
    const response = await fetch(
        'https://cdn.jsdelivr.net/npm/@emoji-mart/data'
    );
    return response.json();
};

export const fetchEmojis = async (): Promise<Emoji[]> => {
    const res = await getEmojiData();
    return Object.values(res.emojis).map((emoji: Emoji) => {
        return emoji;
    });
};
