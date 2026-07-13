---
name: i18n
description: 项目国际化 — i18next + react-i18next 的 key 结构、文件组织、使用方式和修改流程
user-invocable: false
---

# i18n 国际化

## 引擎与文件结构

- **引擎**: `i18next` + `react-i18next`（`@/i18n` 中导出 `useTranslation`）
- **文件**:
  - `src/i18n/en.ts` — 英文基准，`export const en = { ... } as const`，同时导出 `type TranslationKey = keyof typeof en`
  - `src/i18n/zh-CN.ts` — 中文，`Record<TranslationKey, string>` 类型约束（编译检查确保 key 完整）
  - `src/i18n/index.ts` — 初始化（`i18n.use(chromeStorageDetector).use(initReactI18next)`）

## 语言检测顺序

1. `chrome.storage.local` 中读取 `STORAGE_KEYS.LANGUAGE_PREFERENCE`
2. 若无保存值，fallback 到 `navigator.language`
3. 最终 fallback: `'en'`

## 使用方式

```tsx
import { useTranslation } from '@/i18n'

function Component() {
  const { t } = useTranslation()
  return <span>{t('keyName')}</span>
}
```

- **插值**: `t('key', { variable: value })`，模板语法 `{{variable}}`
- **无命名空间**: 所有 key 都在 `translation` namespace 中

## 修改流程

1. 先在 `src/i18n/en.ts` 中添加新 key（英文是所有语言的基准）
2. 同步在 `src/i18n/zh-CN.ts` 中添加对应中文翻译
3. 运行 `pnpm compile`（`tsc --noEmit`）确保无类型错误

## 已有书签相关 key

| Key | en | zh-CN |
|-----|----|-------|
| `bookmarksBarLabel` | Bookmarks bar | 书签栏 |
| `bookmarksBarSizeLabel` | Bar size | 书签栏尺寸 |
| `bookmarksBarSizeCompact` | Compact | 紧凑 |
| `bookmarksBarSizeNormal` | Normal | 适中 |
| `bookmarksBarSizeLarge` | Large | 大 |
| `bookmarkOpenModeLabel` | Open bookmarks | 打开书签 |
| `openInNewTab` | Open in new tab | 在新标签页打开 |
| `editBookmark` | Edit | 修改 |
| `renameFolder` | Rename | 重命名 |
| `deleteBookmark` | Delete | 删除 |
| `openAllInNewTabs` | Open all in new tabs | 在新标签页全部打开 |
| `copyUrl` | Copy URL | 复制 URL |
| `editBookmarkDialogTitle` | Edit bookmark | 修改书签 |
| `renameFolderDialogTitle` | Rename folder | 重命名文件夹 |
| `confirmDelete` | Delete "{{title}}"? | 确认删除「{{title}}」？ |
| `labelLabel` | Label | 名称 |
| `urlLabel` | URL | 网址 |
| `saveButton` | Save | 保存 |
| `cancelButton` | Cancel | 取消 |
