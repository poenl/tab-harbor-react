# Tab Harbor

## 命令速查

| 用途 | 命令 | 说明 |
|---|---|---|
| 开发（Chrome） | `pnpm dev` | WXT HMR 开发服务器 |
| 开发（Firefox） | `pnpm dev:firefox` | |
| 构建（Chrome） | `pnpm build` | |
| 构建（Firefox） | `pnpm build:firefox` | |
| 类型检查 | `pnpm compile` | `tsc --noEmit` |
| 打包 zip（Chrome） | `pnpm zip` | |
| 打包 zip（Firefox） | `pnpm zip:firefox` | |
| 格式化 | `pnpm format` | `npx -y prettier --write .`（编辑器有 Prettier 插件时可省） |

## 重要约束

- **每次修改代码后必须格式化**：运行 `pnpm format`（`npx -y prettier --write .`）。编辑器有 Prettier 插件且确认能自动格式化后可省略。不得在未格式化的情况下提交代码。
- **`postinstall` 自动运行 `wxt prepare`**，生成 `.wxt/` 目录（含 tsconfig 基础配置和类型定义）。`.wxt/` 已 gitignore，**首次克隆或新增依赖后必须运行 `pnpm install`**。
- **Prettier 已配置**，配置文件 `.prettierrc` + `.prettierignore`。编辑器插件会自动读取。
- **WXT 配置入口**：`wxt.config.ts`，目前加载 `@wxt-dev/module-react` 模块，已启用 `srcDir: 'src'` + `entrypointsDir: '.'`。
- **WXT 入口点约定**：`src/` 下的文件自动注册为扩展页面/脚本（`background.ts`、`content.ts`、`popup/`）。
- **使用 `@/` 导入**：`@/` 映射到 `src/` 目录（通过 WXT 的 `srcDir` 配置自动生成，tsc + 打包工具均解析正确）。
- **shadcn 已配置**（v4 + radix-nova 风格 + Tailwind v4），首次添加组件后如遇缺少依赖，运行 `pnpm add <包名>`。关于 shadcn 组件的最佳实践，见 [shadcn 组件策略](#shadcn-组件策略)。
- **「记下」= 写入 AGENTS.md**：当用户说「记下」「记一下」「记住」时，将对应的规则或约定追加到本文件，而不是仅靠上下文记忆。
- **组件注释约定**：每个 TSX 文件中的 JSX 区块前必须添加 `// ── 区名 ──` 注释，标注该区块对应的视觉区域。新增组件、新增区域时都要添加对应注释。
- **始终使用中文回复用户**：所有对话必须使用中文。
- **「记住」= 立即执行**：当用户说「记住 X」，把 X 当成最高优先级指令立即执行（如果可写文件）或立即加入待办（如果只读）。不要只口头确认。
- **严格按用户说的范围执行**：用户要求的事才做，不要扩展范围、不要附加额外任务。
- **禁止擅自启动项目服务**：不要在没有用户要求的情况下运行 `pnpm dev`、`pnpm build` 等开发/构建命令。只有用户明确要求时才执行。
- **永远不要擅自做决定**：代码改什么、怎么改，必须由用户决定。不能自己「觉得这样更好」就擅自改代码。只能执行用户明确要求的改动。

---

## 方案可靠性规则

1. **涉及第三方库时，先查源码/文档判断可行性再动手**。不基于猜测或「试试看」开始改代码。
2. **不确定的方案直接说不确定**，不要包装成「应该可以」「理论上没问题」的确定方案。用「能」或「不能」回答。
3. **同类方案连续失败 3 次后必须停下来**，承认没搞懂，不再换参数重复试。
4. **区分「有个想法」和「有解法」**。想法是假设，解法是经过验证的路线。

---

## shadcn 组件策略

以下组件通过 shadcn CLI 安装并已根据 Tab Harbor 的配色修改：

| 组件 | 文件 | 使用位置 | 修改说明 |
|------|------|---------|---------|
| `Button` | `src/components/ui/button.tsx` | QuickShortcuts 编辑 | 保持 radix-nova 默认 variant（`secondary` / `ghost`） |
| `Input` | `src/components/ui/input.tsx` | QuickShortcuts 编辑器 | 通过 `className` 覆盖 `rounded-xl`、padding、字体、border-color |
| `Dialog` | `src/components/ui/dialog.tsx` | QuickShortcuts 编辑器 | 替换 `IconPlaceholder` 为 `<X>` from `lucide-react` |
| `Tooltip` | `src/components/ui/tooltip.tsx` | GroupNav 导航按钮 | `bg-secondary border-secondary text-primary`，Tailwind className 仅 |
| `Badge` | `src/components/ui/badge.tsx` | DomainGroup 计数 | 用 `variant="secondary"` + `className` 匹配现有 badge 样式 |

**规则：**

1. **优先使用 shadcn 组件**。新增功能时，先看 shadcn 是否有对应组件（`Button`、`Input`、`Dialog`、`Tooltip`、`Badge`、`Select`、`Checkbox` 等），而不是手写。
2. **样式冲突时修改组件文件而不是 CSS 变量**。shadcn 组件文件在 `src/components/ui/` 下，可以自由修改——它们只是一次性生成的模板，不是库代码。
3. **`globals.css` 不动**。shadcn 的 `@theme inline` 变量已经映射了 Tab Harbor 的 4-palette × 2-tone 颜色体系。Tailwind utility class（如 `bg-primary`）会自动使用我们的颜色。
4. **只用 Tailwind className，不用内联 `style`**。需要调整颜色就用现有的 CSS 变量对应的 Tailwind utility（`bg-card`、`text-primary`、`border-primary/20` 等），不写 `color-mix()`、不写 `var()`、不写 `style={{}}`。
5. **`lucide-react` 是默认图标库**（匹配 `components.json` 的 `"iconLibrary": "lucide"`）。优先用 lucide 图标替代内联 SVG。
6. **添加新组件**：`npx shadcn@latest add <组件名>`。如果安装失败（超时），手动装 `@radix-ui/react-<primitive>` 并仿照 `src/components/ui/` 下已有组件手写。
7. **`@radix-ui/*` 包不需要单独装**——`radix-ui` 全量包已经包含所有 Radix primitive 的导出。

## 浏览器调试

- 扩展新标签页 URL: `chrome-extension://<id>/newtab.html`（WXT HMR 开发模式下有效，`<id>` 从 `chrome://extensions` 获取）。
- 对话开始前服务（`pnpm dev`）已经启动，不需要再启动新的服务进程，不需要询问。

---

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **tab-harbor-react** (842 symbols, 1719 relationships, 69 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/tab-harbor-react/context` | Codebase overview, check index freshness |
| `gitnexus://repo/tab-harbor-react/clusters` | All functional areas |
| `gitnexus://repo/tab-harbor-react/processes` | All execution flows |
| `gitnexus://repo/tab-harbor-react/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.agents/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.agents/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.agents/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.agents/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.agents/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.agents/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
