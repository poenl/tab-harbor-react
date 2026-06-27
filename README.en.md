# Tab Harbor

<p>
  <a href="https://github.com/V-IOLE-T/tab-harbor"><img alt="Based on tab-harbor" src="https://img.shields.io/badge/based%20on-tab--harbor-8B5CF6" /></a>
  <a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6" /></a>
  <a href="https://react.dev/"><img alt="React" src="https://img.shields.io/badge/React-19-61DAFB" /></a>
  <a href="https://wxt.dev"><img alt="WXT" src="https://img.shields.io/badge/WXT-0.20-0EA5E9" /></a>
  <a href="https://tailwindcss.com/"><img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4" /></a>
</p>

> A complete rewrite of [tab-harbor](https://github.com/V-IOLE-T/tab-harbor), migrated from vanilla JavaScript to WXT + React 19 + TypeScript + Tailwind CSS.

[**中文**](./README.md)

---

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Installation](#-installation)
- [Tech Stack](#-tech-stack)
- [Development](#-development)
- [Project Structure](#-project-structure)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

---

## 📖 About

Tab Harbor is a Chrome new tab page extension that helps you manage browser tabs, bookmarks, and shortcuts — turning browsing chaos into an organized, calmer workspace.

This repository is a **complete rewrite** of the original [tab-harbor](https://github.com/V-IOLE-T/tab-harbor):

- **Tech upgrade**: vanilla JavaScript → WXT + React 19 + TypeScript 5.9 + Tailwind CSS v4
- **Architecture rewrite**: global scope scripts → modular React components with Zustand state management
- **UI framework**: introduced shadcn/ui (radix-nova style) for consistent component design
- **Build tooling**: Vite + WXT with HMR development experience
- **Enhanced features**: drag-and-drop, bookmarks bar, theme system, and more

The design language and interaction logic remain true to Tab Harbor's core philosophy — **making the browser calmer**.

---

## ✨ Features

### 🗂 Session Management

| Capability | Description |
|------------|-------------|
| Save tabs | Save open tabs as sessions with select/exclude support |
| Drag & drop | Reorder tabs within a session, move between sessions, or drop outside to create a new session |
| Auto-cleanup | Empty sessions are automatically removed |
| Collapse/expand | Collapse sessions to reduce visual clutter |
| Bulk actions | Restore or delete entire sessions in one click |

### 📑 Bookmarks Bar

| Capability | Description |
|------------|-------------|
| Chrome bookmarks | Display bookmarks from the Bookmarks Bar folder at the top of the page |
| Folder navigation | Multi-level folder navigation with nested sub-menus |
| Overflow menu | Auto-show `>>` overflow menu when there are too many items |
| Size options | Compact / normal / large sizes |
| Toggle | Enable or disable from settings |

### 🔗 Quick Shortcuts

| Capability | Description |
|------------|-------------|
| Custom links | Freely add and manage frequently used links |
| Icon cache | Chrome Favicon API with in-memory caching |
| Edit panel | Dialog-based editing with drag-and-drop sorting |

### 🎨 Theme System

| Capability | Description |
|------------|-------------|
| Color schemes | Multiple preset theme colors |
| Dark/light | Each theme has both dark and light variants |
| Opacity control | Customizable surface transparency |
| Live switching | Switch themes without page reload |

---

## 🖼️ Screenshots

![Tab Harbor screenshot](./docs/screenshot.png)

---

## 🔧 Installation

### Load Unpacked

1. Clone the repository:

   ```bash
   git clone https://github.com/V-IOLE-T/tab-harbor-react.git
   cd tab-harbor-react
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Build:

   ```bash
   pnpm build
   ```

4. Open Chrome and visit `chrome://extensions`
5. Enable **Developer mode**
6. Click **Load unpacked**
7. Select the project root (or `.output/chrome-mv3/` directory)

### Chrome Web Store

> Not yet published

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [WXT](https://wxt.dev) + [React 19](https://react.dev) |
| Language | [TypeScript 5.9](https://www.typescriptlang.org) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) (radix-nova) |
| State | [Zustand v5](https://zustand.docs.pmnd.rs) |
| Icons | [lucide-react](https://lucide.dev) |
| Drag & Drop | [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) |
| i18n | [i18next](https://www.i18next.com) + [react-i18next](https://react.i18next.com) |
| Build | [Vite](https://vitejs.dev) + [WXT](https://wxt.dev) |
| Package | [pnpm](https://pnpm.io) |

---

## 🚀 Development

### Commands

| Task | Command | Description |
|------|---------|-------------|
| Dev (Chrome) | `pnpm dev` | WXT HMR dev server |
| Dev (Firefox) | `pnpm dev:firefox` | |
| Build (Chrome) | `pnpm build` | |
| Build (Firefox) | `pnpm build:firefox` | |
| Type check | `pnpm compile` | `tsc --noEmit` |
| Package zip | `pnpm zip` | For publishing |
| Format | `pnpm format` | Prettier |

## 📁 Project Structure

```
src/
├── content.ts              # Content Script
├── newtab/                 # New Tab Page
│   ├── index.html
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/         # New tab components
│   │   ├── BookmarksBar.tsx
│   │   ├── SettingsDropdown.tsx
│   │   └── ...
│   ├── home/               # Home page
│   │   ├── HomePage.tsx
│   │   ├── DomainGroup.tsx
│   │   └── TabChip.tsx
│   └── saved-tabs/         # Session management
│       ├── SavedTabsPage.tsx
│       ├── SavedSessionCard.tsx
│       └── SavedSessionTabRow.tsx
├── popup/                  # Popup panel
│   ├── index.html
│   └── main.tsx
├── components/             # Shared components
│   ├── ui/                 # shadcn/ui
│   └── settings/           # Settings
├── stores/                 # Zustand stores
│   ├── savedSessions.ts
│   └── theme.tsx
├── styles/
│   └── globals.css         # Tailwind + CSS variables
├── i18n/                   # Internationalization
│   ├── en.ts
│   └── zh-CN.ts
└── lib/
    └── utils.ts            # Utilities
```

---

## 📄 License

This repository is a refactor of the original [tab-harbor](https://github.com/V-IOLE-T/tab-harbor) (MIT licensed).

[Apache-2.0](https://github.com/V-IOLE-T/tab-harbor/blob/main/LICENSE)

---

## 🙏 Acknowledgements

- [tab-harbor](https://github.com/V-IOLE-T/tab-harbor) — the original project that this repository is based on
- [Zara](https://github.com/zarazhangrui) — [tab-out](https://github.com/zarazhangrui/tab-out), the upstream starting point
- [WXT](https://wxt.dev) — excellent Web extension framework
- [shadcn/ui](https://ui.shadcn.com) — high-quality UI component library
