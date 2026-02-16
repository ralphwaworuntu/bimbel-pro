'use client';

import { useState, useEffect } from 'react';

interface TypingEffectProps {
    words: string[];
    speed?: number;
    pause?: number;
    className?: string;
}

export default function TypingEffect({ words, speed = 100, pause = 2000, className = '' }: TypingEffectProps) {
    const [index, setIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [reverse, setReverse] = useState(false);
    const [blink, setBlink] = useState(true);

    // Blinking cursor effect
    useEffect(() => {
        const timeout = setTimeout(() => {
            setBlink((prev) => !prev);
        }, 500);
        return () => clearTimeout(timeout);
    }, [blink]);

    // Typing effect
    useEffect(() => {
        if (subIndex === words[index].length + 1 && !reverse) {
            setReverse(true);
            return;
        }

        if (subIndex === 0 && reverse) {
            setReverse(false);
            setIndex((prev) => (prev + 1) % words.length);
            return;
        }

        const timeout = setTimeout(() => {
            setSubIndex((prev) => prev + (reverse ? -1 : 1));
        }, Math.max(reverse ? 75 : subIndex === words[index].length ? pause : speed, parseInt((Math.random() * 30).toString())));

        return () => clearTimeout(timeout);
    }, [subIndex, index, reverse, words, speed, pause]);

    return (
        <span className={className}>
            {words[index].substring(0, subIndex)}
            <span className={`typing-cursor ${blink ? 'blink' : ''}`}>|</span>
            <style jsx>{`
                .typing-cursor {
                    font-weight: 100;
                    color: currentColor;
                    opacity: 1;
                }
                .blink {
                    opacity: 0;
                }
            `}</style>
        </span>
    );
}
