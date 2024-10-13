import { useEffect, useRef, useCallback } from 'react';

type EasingFunction = (t: number) => number;

const defaultEaseInOutQuad: EasingFunction = (t) =>
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

const useSmoothScroll = () => {
    const scrollAnimationRef = useRef<number | null>(null);
    const startScrollTopRef = useRef<number>(0);
    const targetScrollTopRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);
    const durationRef = useRef<number>(500);
    const velocityRef = useRef<number>(0);
    const directionRef = useRef<number>(0);
    const previousTimeRef = useRef<number>(0);
    const previousScrollTopRef = useRef<number>(0);

    const cancelScrollAnimation = () => {
        if (scrollAnimationRef.current !== null) {
            cancelAnimationFrame(scrollAnimationRef.current);
            scrollAnimationRef.current = null;
        }
    };

    const initializeAnimation = (currentTime: number, container: HTMLElement, targetScrollTop: number, duration: number, newDirection: number) => {
        startTimeRef.current = currentTime;
        previousTimeRef.current = currentTime;
        startScrollTopRef.current = container.scrollTop;
        previousScrollTopRef.current = container.scrollTop;
        targetScrollTopRef.current = targetScrollTop;
        durationRef.current = duration;
        directionRef.current = newDirection;
        velocityRef.current = 0;
    };

    const calculateNewScrollTop = (progress: number): number => {
        return (
            startScrollTopRef.current +
            (targetScrollTopRef.current - startScrollTopRef.current) * progress
        );
    };

    const animateScroll = useCallback((currentTime: number, container: HTMLElement, easing: EasingFunction) => {
        if (!startTimeRef.current) {
            initializeAnimation(currentTime, container, targetScrollTopRef.current, durationRef.current, directionRef.current);
        }

        const elapsed = currentTime - startTimeRef.current;
        const deltaTime = currentTime - previousTimeRef.current;
        previousTimeRef.current = currentTime;

        const progress = Math.min(elapsed / durationRef.current, 1);
        const easedProgress = easing(progress);

        const newScrollTop = calculateNewScrollTop(easedProgress);

        container.scrollTop = newScrollTop;

        const deltaScroll = newScrollTop - previousScrollTopRef.current;
        velocityRef.current = deltaTime > 0 ? deltaScroll / deltaTime : 0;
        previousScrollTopRef.current = newScrollTop;

        if (progress < 1) {
            scrollAnimationRef.current = requestAnimationFrame((time) =>
                animateScroll(time, container, easing)
            );
        } else {
            finalizeScroll(container);
        }
    }, []);

    const finalizeScroll = (container: HTMLElement) => {
        container.scrollTop = targetScrollTopRef.current;
        scrollAnimationRef.current = null;
        startTimeRef.current = 0;
        previousTimeRef.current = 0;
        previousScrollTopRef.current = 0;
        velocityRef.current = 0;
    };

    const smoothScroll = useCallback(
        (
            container: HTMLElement,
            target: HTMLElement,
            duration: number = 500,
            easing: EasingFunction = defaultEaseInOutQuad
        ) => {
            if (!container || !target) {
                console.warn('Container or target element is not provided.');
                return;
            }

            const targetRect = target.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            let targetScrollTop =
                container.scrollTop +
                (targetRect.top - containerRect.top) -
                container.clientHeight / 2 +
                target.clientHeight / 2;

            targetScrollTop = Math.max(
                0,
                Math.min(targetScrollTop, container.scrollHeight - container.clientHeight)
            );

            const newDirection = Math.sign(targetScrollTop - container.scrollTop);

            if (scrollAnimationRef.current !== null && newDirection === directionRef.current) {
                const additionalScroll = velocityRef.current * duration;
                targetScrollTop += additionalScroll;
                targetScrollTop = Math.max(
                    0,
                    Math.min(targetScrollTop, container.scrollHeight - container.clientHeight)
                );
                targetScrollTopRef.current = targetScrollTop;
            } else {
                cancelScrollAnimation();
                initializeAnimation(performance.now(), container, targetScrollTop, duration, newDirection);
                scrollAnimationRef.current = requestAnimationFrame((time) =>
                    animateScroll(time, container, easing)
                );
            }
        },
        [animateScroll]
    );

    useEffect(() => {
        return () => {
            cancelScrollAnimation();
        };
    }, []);

    return smoothScroll;
};

export default useSmoothScroll;
