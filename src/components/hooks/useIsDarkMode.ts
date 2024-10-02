import { useEffect, useState } from 'react';

export const useIsDarkMode = () => {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

    useEffect(() => {
        const determineTheme = () => {
            if (typeof window !== 'undefined') {
                return document.documentElement.classList.contains('dark');
            }
            return false;
        };
        setIsDarkMode(determineTheme());

        const observer = new MutationObserver(() => {
            setIsDarkMode(determineTheme());
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });
        return () => observer.disconnect();
    }, []);

    return isDarkMode;
};
