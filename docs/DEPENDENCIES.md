# iBlog 本地迁移与依赖安装指南

本通过描述了将 iBlog 从在线环境迁移到本地开发环境所需的依赖包、版本信息及配置步骤。

## 1. 项目初始化 (推荐)

推荐使用 **Vite** 构建工具初始化 React + TypeScript 项目，因为它轻量且速度快。

```bash
# 创建项目 (跟随提示选择 React 和 TypeScript)
npm create vite@latest iblog -- --template react-ts

# 进入项目目录
cd iblog
```

## 2. 核心依赖 (Dependencies)

以下是项目中实际运行所需的库。请按照指定的版本号安装，以确保兼容性。

| 库名称 | 用途 | 推荐版本 | 安装命令 |
| :--- | :--- | :--- | :--- |
| **react** | UI 核心库 | ^19.0.0 | `npm install react@^19.0.0 react-dom@^19.0.0` |
| **react-router-dom** | 路由管理 | ^7.0.0 | `npm install react-router-dom@^7.0.0` |
| **lucide-react** | 图标库 | ^0.470.0 | `npm install lucide-react` |
| **@google/genai** | Google Gemini AI SDK | ^1.31.0 | `npm install @google/genai` |
| **three** | 3D 渲染库 | ^0.160.0 | `npm install three @types/three` |
| **gsap** | 高级动画库 | ^3.12.5 | `npm install gsap` |
| **@uiw/react-md-editor** | Markdown 编辑与渲染 | ^4.0.0 | `npm install @uiw/react-md-editor` |

**一键安装命令:**

```bash
npm install react@^19.0.0 react-dom@^19.0.0 react-router-dom@^7.0.0 lucide-react @google/genai three gsap @uiw/react-md-editor
```

## 3. 开发依赖 (DevDependencies)

原项目使用了 Tailwind CSS 的 CDN 版本。迁移到本地时，**必须**安装本地构建版本以获得最佳性能和开发体验。

| 库名称 | 用途 | 安装命令 |
| :--- | :--- | :--- |
| **tailwindcss** | CSS 框架 | `npm install -D tailwindcss postcss autoprefixer` |
| **@types/node** | Node类型定义(用于环境变量) | `npm install -D @types/node` |
| **@types/three** | Three.js 类型定义 | `npm install -D @types/three` |

**一键安装命令:**

```bash
npm install -D tailwindcss postcss autoprefixer @types/node @types/three
```

## 4. Tailwind CSS 配置步骤

在线版使用了 CDN，本地版需要初始化配置文件。

1.  **初始化配置:**
    ```bash
    npx tailwindcss init -p
    ```

2.  **修改 `tailwind.config.js`:**
    将原 `index.html` 中的 Tailwind 配置迁移到此文件。

    ```javascript
    /** @type {import('tailwindcss').Config} */
    export default {
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
      ],
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            apple: {
              bg: 'var(--apple-bg)',
              card: 'var(--apple-card)',
              blue: 'var(--apple-blue)',
              text: 'var(--apple-text)',
              subtext: 'var(--apple-subtext)',
              gray: 'var(--apple-gray)',
              'dark-bg': '#000000',
              'dark-card': '#1c1c1e',
              'dark-text': '#f5f5f7',
              'dark-subtext': '#a1a1a6',
            }
          },
          animation: {
            'spin-slow': 'spin 12s linear infinite',
            'slide-up-fade': 'slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            'modal-spring': 'modalSpring 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1) forwards',
          },
          // ... 其他 keyframes 配置
        },
      },
      plugins: [],
    }
    ```

3.  **在 CSS 中引入 (例如 `src/index.css`):**
    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    :root {
        --apple-bg: #f2f2f7;
        --apple-card: #ffffff;
        --apple-blue: #0071e3;
        --apple-text: #1d1d1f;
        /* ... 其他变量 ... */
    }
    ```

## 5. 环境变量配置 (API Key)

原代码使用 `process.env.API_KEY`。在 Vite 中，推荐使用 `import.meta.env`，或者在 `vite.config.ts` 中配置 `define`。

**方法 A (推荐 - 修改代码):**
1. 在根目录创建 `.env` 文件:
   ```env
   VITE_API_KEY=your_google_api_key_here
   ```
2. 将代码中所有的 `process.env.API_KEY` 替换为 `import.meta.env.VITE_API_KEY`。

**方法 B (兼容 - 修改配置):**
如果不希望修改代码，可以在 `vite.config.ts` 中添加定义：

```typescript
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  }
})
```
并在 `.env` 文件中设置 `API_KEY=xxx`。

## 6. 运行项目

完成上述步骤后：

```bash
npm run dev
```