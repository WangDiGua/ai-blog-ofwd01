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

/**
 * 校验文件 (主要用于图片)
 * @param file 
 * @param options max size in MB, allowed types
 */
export function validateImage(file: File, options: { maxSizeMB?: number, allowedTypes?: string[] } = {}): { valid: boolean, error?: string } {
    const maxSizeMB = options.maxSizeMB || 2;
    const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: '不支持的文件格式。请上传 JPG, PNG, GIF 或 WEBP。' };
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
        return { valid: false, error: `文件大小不能超过 ${maxSizeMB}MB。` };
    }

    return { valid: true };
}

/**
 * 生成标题 ID (用于目录跳转)
 * 移除特殊字符，保留中文、字母、数字、连字符
 */
export function generateHeadingId(text: string): string {
    return text
        .toString()
        .trim()
        .toLowerCase()
        // 移除 Markdown 符号 (如 **bold**)
        .replace(/\*\*(.*?)\*\*/g, '$1') 
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 移除链接
        // 替换空格为连字符
        .replace(/\s+/g, '-')
        // 仅保留 字母、数字、中文、连字符
        .replace(/[^\w\-\u4e00-\u9fa5]/g, '')
        // 避免连续连字符
        .replace(/\-\-+/g, '-');
}

/**
 * 校验是否为合法 URL (用于防止 Open Redirect)
 * 仅允许 http/https 协议
 */
export function isValidUrl(string: string): boolean {
    try {
        const url = new URL(string);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
        return false;
    }
}