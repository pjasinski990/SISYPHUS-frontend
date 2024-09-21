import React, { useRef } from 'react';
import { animated, useSpring } from 'react-spring';
import { useDrag } from 'react-use-gesture';
import { GripVertical } from "lucide-react";

interface SlidingPanelProps {
    isOpen: boolean;
    setIsOpen: (state: boolean) => void;
    children: React.ReactNode;
    width: number;
    height?: string;
}

export const SlidingPanel: React.FC<SlidingPanelProps> = ({
                                                              isOpen,
                                                              setIsOpen,
                                                              children,
                                                              width = 400,
                                                              height = '85vh',
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
        { axis: 'x', bounds: { left: isOpen? -width : 0, right: isOpen? 0 : width }, rubberband: true }
    );

    return (
        <animated.div
            ref={panelRef}
            className="overflow-hidden relative"
            style={{
                width,
                x,
                height: '80vh',
                position: 'absolute',
                top: '54%',
                left: '50px',
                transform: 'translateY(-50%)',
                zIndex: 1000,
                boxShadow: '2px 0 5px rgba(0,0,0,0.3)',
            }}
        >
            <div className="h-full overflow-auto pr-6">
                {children}
                <div
                    className="grabbing-bar absolute top-0 right-0 h-full w-8 cursor-ew-resize bg-gray-200 bg-opacity-80 flex items-center justify-center"
                    style={{
                        touchAction: 'none',
                    }}
                    {...bind()}
                >
                    <GripVertical size={24} className="text-gray-500"/>
                </div>
            </div>
        </animated.div>
    );
};
