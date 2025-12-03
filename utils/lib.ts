import { Article, CommunityPost, Song } from '../types';

/**
 * Generic Debounce Function
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
 */
class MockRequest {
  private latency = 600; // ms

  private async interceptor() {
    await new Promise(resolve => setTimeout(resolve, 200)); 
    return true;
  }

  async get<T>(endpoint: string, params: any = {}): Promise<T> {
    await this.interceptor();
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock Routing
        if (endpoint === '/articles') {
          let data = [...MOCK_ARTICLES];
          
          // Search Filter
          if (params.q) {
            const lowerQ = params.q.toLowerCase();
            data = data.filter(a => 
              a.title.toLowerCase().includes(lowerQ) || 
              a.summary.toLowerCase().includes(lowerQ)
            );
          }

          // Pagination
          const page = params.page || 1;
          const limit = params.limit || 1000;
          const total = data.length;
          const start = (page - 1) * limit;
          const end = start + limit;
          
          const result = {
            items: data.slice(start, end),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          };

          resolve(result as unknown as T);

        } else if (endpoint.startsWith('/articles/')) {
          const id = endpoint.split('/')[2];
          const article = MOCK_ARTICLES.find(a => a.id === id);
          if (article) resolve(article as unknown as T);
          else reject({ status: 404, message: 'Article Not Found' });

        } else if (endpoint === '/community') {
          resolve(MOCK_POSTS as unknown as T);
        } else if (endpoint === '/music') {
          resolve(MOCK_SONGS as unknown as T);
        } else {
          console.error(`[Mock 404] ${endpoint} not found`);
          reject({ status: 404, message: 'Not Found' });
        }
      }, this.latency);
    });
  }

  // Simulate Post for Login
  async post<T>(endpoint: string, body: any = {}): Promise<T> {
    await this.interceptor();
    return new Promise((resolve, reject) => {
       setTimeout(() => {
          if (endpoint === '/login') {
             if (body.username) {
               resolve({
                  id: 'u-123',
                  name: body.username,
                  avatar: `https://ui-avatars.com/api/?name=${body.username}&background=0071e3&color=fff`,
                  email: `${body.username}@example.com`
               } as unknown as T);
             } else {
               reject({message: 'Invalid credentials'});
             }
          } else {
             resolve({ success: true } as unknown as T);
          }
       }, 500);
    });
  }
}

export const request = new MockRequest();

// --- MOCK DATA ---

const LONG_CONTENT = `
## Introduction
The digital landscape is constantly evolving. As developers and designers, we must stay ahead of the curve. This article explores the fundamental shifts we're seeing in user interface design.

## The Glassmorphism Trend
Glassmorphism is more than just a buzzword. It represents a shift towards depth and hierarchy without the clutter. 
*   **Translucency**: Using backdrop-filter to create a sense of place.
*   **Vibrancy**: Using subtle gradients to make content pop.
*   **Border**: Thin, semi-transparent borders to define edges.

## Component Architecture
Building scalable web applications requires a solid foundation.
1.  **Atomic Design**: Breaking down interfaces into smallest parts.
2.  **Compound Components**: Managing state within complex UI elements.
3.  **Hooks Pattern**: Reusing logic across the application.

## Performance Matters
A beautiful site is useless if it's slow. Optimizing for Core Web Vitals is crucial.
> "Speed is a feature." - Old web wisdom.

## Conclusion
Embrace the change. Keep learning.
`;

const TITLES = [
    "The Future of UI Design in 2025",
    "Understanding React 19 Server Components",
    "Why Minimalism Never Goes Out of Style",
    "A Guide to Apple's Design Philosophy",
    "Mastering TypeScript Generics",
    "The Rise of AI in Frontend Development",
    "Building Accessible Web Apps",
    "CSS Grid vs Flexbox: The Ultimate Guide",
    "Optimizing Web Performance",
    "Digital Detox for Developers",
    "The Art of Code Refactoring",
    "Next.js vs Remix: A Comparison",
    "Understanding State Management",
    "WebAssembly: The Next Frontier",
    "Micro-interactions in UX"
];

const MOCK_ARTICLES: Article[] = TITLES.map((title, i) => ({
  id: `art-${i}`,
  title: title,
  summary: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
  content: LONG_CONTENT,
  cover: `https://picsum.photos/seed/art${i}/800/600`,
  views: Math.floor(Math.random() * 5000) + 100,
  likes: Math.floor(Math.random() * 500),
  category: ["Tech", "Design", "Life"][Math.floor(Math.random() * 3)],
  date: "Oct 24, 2024",
  comments: [
    { id: 'c1', user: { id: 'u1', name: 'Alice', avatar: 'https://picsum.photos/seed/u1/50' }, content: 'Great article!', date: '2 hours ago' },
    { id: 'c2', user: { id: 'u2', name: 'Bob', avatar: 'https://picsum.photos/seed/u2/50' }, content: 'Very insightful, thanks for sharing.', date: '1 day ago' }
  ]
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