import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// 注册插件
gsap.registerPlugin(ScrollTrigger);

interface ParallaxProps {
    children: React.ReactNode;
    speed?: number; // 视差速度，负值反向，正值同向
    className?: string;
    id?: string;
    lag?: number; // 物理惯性 (秒)
}

/**
 * ParallaxFloat
 * 这是一个容器组件，会根据滚动位置移动其内部内容。
 * 用于让整个卡片或文本块产生“漂浮”错觉。
 */
export const ParallaxFloat = ({ 
    children, 
    speed = 0.5, 
    className = "", 
    id,
    lag = 1 
}: ParallaxProps) => {
    const triggerRef = useRef<HTMLDivElement>(null);
    const targetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const yOffset = 100 * speed;

            gsap.fromTo(targetRef.current, 
                { 
                    y: -yOffset 
                },
                {
                    y: yOffset,
                    ease: "none",
                    scrollTrigger: {
                        trigger: triggerRef.current,
                        start: "top bottom", // 当元素顶部到达视口底部
                        end: "bottom top",   // 当元素底部到达视口顶部
                        scrub: lag,          // 核心：物理惯性 (秒)
                    }
                }
            );
        }, triggerRef);

        return () => ctx.revert();
    }, [speed, lag]);

    return (
        <div ref={triggerRef} className={`relative ${className}`} id={id}>
            <div ref={targetRef} className="will-change-transform">
                {children}
            </div>
        </div>
    );
};

/**
 * ParallaxImage
 * 这是一个图片组件，图片会在容器内反向移动，产生经典的“窗户”视差效果。
 * 容器必须设置 overflow-hidden。
 */
export const ParallaxImage = ({ 
    src, 
    alt, 
    className = "", 
    containerClassName = "",
    scale = 1.2 
}: { 
    src: string, 
    alt: string, 
    className?: string, 
    containerClassName?: string,
    scale?: number 
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(imgRef.current,
                {
                    yPercent: -15, // 初始位置向上偏移
                    scale: scale   // 放大以避免移动时露出边缘
                },
                {
                    yPercent: 15,  // 结束位置向下偏移
                    ease: "none",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 1.2 // 惯性
                    }
                }
            );
        }, containerRef);

        return () => ctx.revert();
    }, [scale]);

    return (
        <div ref={containerRef} className={`overflow-hidden relative ${containerClassName}`}>
            <img 
                ref={imgRef}
                src={src}
                alt={alt}
                className={`w-full h-full object-cover will-change-transform ${className}`}
            />
        </div>
    );
};
