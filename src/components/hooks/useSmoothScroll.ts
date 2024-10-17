import { useEffect, useRef, useCallback } from 'react';

interface ScrollState {
    position: number;
    velocity: number;
}

const FRAME_DURATION = 1000 / 60;
const SPRING_TENSION = 170;
const SPRING_FRICTION = 26;
const VELOCITY_THRESHOLD = 0.1;
const DISTANCE_THRESHOLD = 0.1;

const useSmoothScroll = () => {
    const scrollAnimationRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLElement | null>(null);
    const targetPositionRef = useRef<number>(0);
    const scrollStateRef = useRef<ScrollState>({ position: 0, velocity: 0 });
    const lastTimeRef = useRef<number>(0);

    const cancelScrollAnimation = useCallback(() => {
        if (scrollAnimationRef.current !== null) {
            cancelAnimationFrame(scrollAnimationRef.current);
            scrollAnimationRef.current = null;
        }
    }, []);

    const springAnimation = useCallback(
        (currentTime: number) => {
            if (!containerRef.current) return;

            const deltaTime = currentTime - lastTimeRef.current;
            lastTimeRef.current = currentTime;

            const fixedDeltaTime = Math.min(deltaTime, FRAME_DURATION) / 1000;

            const state = scrollStateRef.current;
            const distance = targetPositionRef.current - state.position;

            const springForce = distance * SPRING_TENSION;
            const dampingForce = -state.velocity * SPRING_FRICTION;
            const acceleration = springForce + dampingForce;

            state.velocity += acceleration * fixedDeltaTime;
            state.position += state.velocity * fixedDeltaTime;

            containerRef.current.scrollTop = state.position;

            if (
                Math.abs(state.velocity) < VELOCITY_THRESHOLD &&
                Math.abs(distance) < DISTANCE_THRESHOLD
            ) {
                cancelScrollAnimation();
                containerRef.current.scrollTop = targetPositionRef.current;
                containerRef.current.style.willChange = '';
            } else {
                scrollAnimationRef.current =
                    requestAnimationFrame(springAnimation);
            }
        },
        [cancelScrollAnimation]
    );

    const smoothScroll = useCallback(
        (container: HTMLElement, target: HTMLElement) => {
            if (!container || !target) {
                console.warn('Container or target element is not provided.');
                return;
            }

            containerRef.current = container;
            container.style.willChange = 'scroll-position';

            const targetRect = target.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            const currentPosition = container.scrollTop;
            targetPositionRef.current =
                currentPosition +
                (targetRect.top - containerRect.top) -
                container.clientHeight / 2 +
                target.clientHeight / 2;

            targetPositionRef.current = Math.max(
                0,
                Math.min(
                    targetPositionRef.current,
                    container.scrollHeight - container.clientHeight
                )
            );

            scrollStateRef.current = {
                position: currentPosition,
                velocity: 0,
            };

            cancelScrollAnimation();
            lastTimeRef.current = performance.now();
            scrollAnimationRef.current = requestAnimationFrame(springAnimation);
        },
        [cancelScrollAnimation, springAnimation]
    );

    useEffect(() => {
        return () => {
            cancelScrollAnimation();
            if (containerRef.current) {
                containerRef.current.style.willChange = '';
            }
        };
    }, [cancelScrollAnimation]);

    return smoothScroll;
};

export default useSmoothScroll;
