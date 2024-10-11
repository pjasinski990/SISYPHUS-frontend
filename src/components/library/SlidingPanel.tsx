import React from 'react';
import { animated, useSpring } from 'react-spring';

interface SlidingPanelProps {
    isOpen: boolean;
    setIsOpen: (state: boolean) => void;
    children: React.ReactNode;
    maxWidth: number;
}

export const SlidingPanel: React.FC<SlidingPanelProps> = ({
    isOpen,
    children,
    maxWidth,
}) => {
    const widthStyles = useSpring({
        width: isOpen ? maxWidth : 0,
        config: { tension: 300, friction: 30 },
    });

    const contentStyles = useSpring({
        opacity: isOpen ? 1 : 0,
        config: { tension: 300, friction: 30 },
    });

    return (
        <animated.div
            className="bg-white dark:bg-slate-950"
            style={widthStyles}
        >
            {isOpen && (
                <animated.div
                    style={{
                        ...contentStyles,
                        pointerEvents: isOpen ? 'auto' : 'none',
                    }}
                >
                    {children}
                </animated.div>
            )}
        </animated.div>
    );
};
