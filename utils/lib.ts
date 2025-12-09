/**
 * 通用防抖函数
 */
export function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * 通用节流函数
 */
export function throttle<T extends (...args: any[]) => void>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 计算阅读时间
 * 假设中文阅读速度约为 400 字/分钟，英文约为 200 词/分钟
 * 这里简化为按字符数计算，约 400 字符/分钟
 */
export function calculateReadingTime(content: string): string {
    if (!content) return '1 分钟阅读';
    const textLength = content.length;
    const wordsPerMinute = 400;
    const minutes = Math.ceil(textLength / wordsPerMinute);
    return `${minutes} 分钟阅读`;
}
