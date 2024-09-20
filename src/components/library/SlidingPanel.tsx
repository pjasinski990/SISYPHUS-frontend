import React, { useRef } from 'react';
import { useSpring, animated } from 'react-spring';
import { useDrag } from 'react-use-gesture';

interface SlidingPanelProps {
    isOpen: boolean;
    setIsOpen: (state: boolean) => void;
    children: React.ReactNode;
    width: number;
    height: number;
}

export const SlidingPanel: React.FC<SlidingPanelProps> = ({
                                                              isOpen,
                                                              setIsOpen,
                                                              children,
                                                              width = 400,
                                                              height = 600,
                                                          }) => {
    const panelRef = useRef<HTMLDivElement>(null);

    const [{ x }, api] = useSpring(() => ({
        x: isOpen ? 0 : -width,
        config: { tension: 250, friction: 30 },
    }));

    const bind = useDrag(
        ({ down, movement: [mx], direction: [dx], velocities }) => {
            const trigger = ((isOpen && mx < width / 3) || (!isOpen && mx > width / 3)) || velocities[0] > 0.3;
            if (down) {
                api.start({ x: isOpen ? mx : mx - width });
            } else {
                if (isOpen) {
                    if (dx < 0 && trigger) {
                        api.start({ x: -width });
                        setIsOpen(false);
                    } else {
                        api.start({ x: 0 });
                    }
                } else {
                    if (dx > 0 && trigger) {
                        api.start({ x: 0 });
                        setIsOpen(true);
                    } else {
                        api.start({ x: -width });
                    }
                }
            }
        },
        { axis: 'x', bounds: { left: isOpen? -width : 0, right: isOpen? 0 : width }, rubberband: false }
    );

    return (
        <animated.div
            ref={panelRef}
            {...bind()}
            style={{
                x,
                width,
                height,
                position: 'absolute',
                top: '50%',
                left: 0,
                transform: 'translateY(-50%) translateX(50px)',
                zIndex: 1000,
                boxShadow: '2px 0 5px rgba(0,0,0,0.3)',
                touchAction: 'none',
            }}
        >
            {children}
        </animated.div>
    );
};
