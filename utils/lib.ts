import { Article, CommunityPost, Song } from '../types';

/**
 * Generic Debounce Function
 * Delays the execution of a function until after 'wait' milliseconds have elapsed
 * since the last time it was invoked.
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
 * Generic Throttle Function
 * Ensures a function is called at most once in a specified time period.
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
 * Simulated Request Module (Mocking Axios)
 * Simulates network latency, interceptors, and data fetching.
 */
class MockRequest {
  private latency = 800; // ms

  // Simulating an interceptor that checks for a token
  private async interceptor() {
    // console.log('[Request Interceptor]: Checking auth token...');
    await new Promise(resolve => setTimeout(resolve, 200)); // slight overhead
    return true;
  }

  async get<T>(endpoint: string, params: any = {}): Promise<T> {
    await this.interceptor();
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock Routing
        if (endpoint === '/articles') {
          resolve(MOCK_ARTICLES as unknown as T);
        } else if (endpoint === '/community') {
          resolve(MOCK_POSTS as unknown as T);
        } else if (endpoint === '/music') {
          resolve(MOCK_SONGS as unknown as T);
        } else {
          // 404 Simulation
          console.error(`[Mock 404] ${endpoint} not found`);
          reject({ status: 404, message: 'Not Found' });
        }
      }, this.latency);
    });
  }
}

export const request = new MockRequest();

// --- MOCK DATA ---

const MOCK_ARTICLES: Article[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `art-${i}`,
  title: [
    "The Future of UI Design in 2025",
    "Understanding React 19 Server Components",
    "Why Minimalism Never Goes Out of Style",
    "A Guide to Apple's Design Philosophy",
    "Mastering TypeScript Generics",
    "The Rise of AI in Frontend Development",
    "Building Accessible Web Apps",
    "CSS Grid vs Flexbox: The Ultimate Guide",
    "Optimizing Web Performance",
    "Digital Detox for Developers"
  ][i],
  summary: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
  cover: `https://picsum.photos/seed/art${i}/800/600`,
  views: Math.floor(Math.random() * 5000) + 100,
  category: ["Tech", "Design", "Life"][Math.floor(Math.random() * 3)],
  date: "Oct 24, 2024"
}));

const MOCK_POSTS: CommunityPost[] = Array.from({ length: 5 }).map((_, i) => ({
  id: `post-${i}`,
  author: {
    id: `u-${i}`,
    name: ["Alex Doe", "Sarah Smith", "Mike Ross", "Emily Blunt", "John Snow"][i],
    avatar: `https://picsum.photos/seed/user${i}/100/100`
  },
  content: "Just checking out this new blog design. The frosted glass effect is really smooth! Has anyone tried implementing this with pure CSS backdrop-filter?",
  likes: Math.floor(Math.random() * 50),
  comments: Math.floor(Math.random() * 10),
  timeAgo: `${i + 1}h ago`
}));

const MOCK_SONGS: Song[] = [
  { id: '1', title: 'Midnight City', artist: 'M83', cover: 'https://picsum.photos/seed/m83/300/300', duration: 243 },
  { id: '2', title: 'Instant Crush', artist: 'Daft Punk', cover: 'https://picsum.photos/seed/daft/300/300', duration: 337 },
  { id: '3', title: 'The Less I Know', artist: 'Tame Impala', cover: 'https://picsum.photos/seed/tame/300/300', duration: 216 },
  { id: '4', title: 'Blinding Lights', artist: 'The Weeknd', cover: 'https://picsum.photos/seed/week/300/300', duration: 200 },
];
