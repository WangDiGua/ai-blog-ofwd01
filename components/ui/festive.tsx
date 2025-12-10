import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useStore } from '../../context/store';

// 粒子类型定义
interface Particle {
    id: number;
    x: number; // Left percentage (0-100)
    delay: number; // Animation delay
    duration: number; // Animation duration
    size: number; // Font size or scale
    swing: number; // Horizontal swing amount
    content: string; // Emoji char
}

export const FestiveWidget = () => {
    const { showFestive, seasonMode } = useStore();
    const [activeSeason, setActiveSeason] = useState<'spring' | 'summer' | 'autumn' | 'winter'>('spring');
    const [particles, setParticles] = useState<Particle[]>([]);

    // 1. 判断生效的季节（手动 或 自动）
    useEffect(() => {
        if (seasonMode !== 'auto') {
            setActiveSeason(seasonMode);
        } else {
            const month = new Date().getMonth() + 1; // 1-12
            if (month >= 3 && month <= 5) setActiveSeason('spring');
            else if (month >= 6 && month <= 8) setActiveSeason('summer');
            else if (month >= 9 && month <= 11) setActiveSeason('autumn');
            else setActiveSeason('winter');
        }
    }, [seasonMode]);

    // 2. 生成粒子系统
    useEffect(() => {
        if (!showFestive) {
            setParticles([]);
            return;
        }

        const count = 30; // 粒子数量
        const newParticles: Particle[] = [];
        
        // 根据季节选择不同的粒子内容
        const getEmoji = () => {
            switch(activeSeason) {
                case 'spring': return ['🌸', '💮', '🌱'][Math.floor(Math.random() * 3)];
                case 'summer': return ['✨', '🫧', '☀️'][Math.floor(Math.random() * 3)];
                case 'autumn': return ['🍁', '🍂', '🌾'][Math.floor(Math.random() * 3)];
                case 'winter': return ['❄️', '❅', '🌨️'][Math.floor(Math.random() * 3)];
            }
        };

        for (let i = 0; i < count; i++) {
            newParticles.push({
                id: i,
                x: Math.random() * 100, // 0-100vw
                delay: Math.random() * 10, // 0-10s delay
                duration: 10 + Math.random() * 10, // 10-20s duration
                size: 10 + Math.random() * 20, // 10-30px
                swing: Math.random() * 50 - 25, // -25 to 25px swing
                content: getEmoji()
            });
        }
        setParticles(newParticles);
    }, [showFestive, activeSeason]);

    if (!showFestive) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
            <style>{`
                @keyframes fall {
                    0% {
                        transform: translateY(-10vh) translateX(0) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(110vh) translateX(var(--swing)) rotate(360deg);
                        opacity: 0.3;
                    }
                }
            `}</style>
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute top-0 select-none will-change-transform"
                    style={{
                        left: `${p.x}%`,
                        fontSize: `${p.size}px`,
                        animationName: 'fall',
                        animationDuration: `${p.duration}s`,
                        animationDelay: `-${p.delay}s`, // 负延迟使动画立即在中间开始
                        animationIterationCount: 'infinite',
                        animationTimingFunction: 'linear',
                        ['--swing' as any]: `${p.swing}px`
                    }}
                >
                    {p.content}
                </div>
            ))}
        </div>,
        document.body
    );
};