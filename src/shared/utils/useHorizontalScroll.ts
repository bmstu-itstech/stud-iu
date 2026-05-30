'use client';
import { useRef, useEffect } from 'react';

export default function useHorizontalScroll() {
    const elRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = elRef.current;
        if (!el) return;

        const isTouch = window.matchMedia('(pointer: coarse)').matches;

        const onWheel = (e: WheelEvent) => {
            if (isTouch) return;
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
            if (e.deltaY === 0 || e.shiftKey) return;

            const isAtLeft = el.scrollLeft <= 0;
            const isAtRight = Math.abs(el.scrollLeft + el.clientWidth - el.scrollWidth) <= 1;

            if ((isAtLeft && e.deltaY < 0) || (isAtRight && e.deltaY > 0)) {
                return;
            }

            e.preventDefault();
            el.scrollLeft += e.deltaY;
        };

        let isDown = false;
        let startX: number;
        let scrollLeft: number;
        let isDragging = false;

        const onMouseDown = (e: MouseEvent) => {
            if (isTouch) return;
            isDown = true;
            isDragging = false;
            startX = e.pageX - el.offsetLeft;
            scrollLeft = el.scrollLeft;
            el.style.cursor = 'grabbing';
        };

        const onMouseLeave = () => {
            if (!isDown) return;
            isDown = false;
            el.style.cursor = 'grab';
        };

        const onMouseUp = () => {
            if (!isDown) return;
            isDown = false;
            el.style.cursor = 'grab';
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isDown || isTouch) return;
            e.preventDefault();
            
            const x = e.pageX - el.offsetLeft;
            const walk = (x - startX) * 1.5;
            
            if (Math.abs(walk) > 5) {
                isDragging = true;
            }
            
            el.scrollLeft = scrollLeft - walk;
        };

        const onClick = (e: MouseEvent) => {
            if (isDragging) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        if (!isTouch) {
            el.style.cursor = 'grab';
        }

        el.addEventListener('wheel', onWheel, { passive: false });
        el.addEventListener('mousedown', onMouseDown);
        el.addEventListener('mouseleave', onMouseLeave);
        el.addEventListener('mouseup', onMouseUp);
        el.addEventListener('mousemove', onMouseMove);
        el.addEventListener('click', onClick, true); 

        return () => {
            el.removeEventListener('wheel', onWheel);
            el.removeEventListener('mousedown', onMouseDown);
            el.removeEventListener('mouseleave', onMouseLeave);
            el.removeEventListener('mouseup', onMouseUp);
            el.removeEventListener('mousemove', onMouseMove);
            el.removeEventListener('click', onClick, true);
        };
    },[]);
    
    return elRef;
}
