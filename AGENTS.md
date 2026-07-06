# Tab Harbor

## 命令速查

| 用途 | 命令 | 说明 |
|---|---|---|
| 开发（Chrome） | `pnpm dev`（项目服务默认已启动，禁止重复启动服务） | |
| 开发（Firefox） | `pnpm dev:firefox`（项目服务默认已启动，禁止重复启动服务） | |
| 构建（Chrome） | `pnpm build` | |
| 构建（Firefox） | `pnpm build:firefox` | |
| 类型检查 | `pnpm compile` | `tsc --noEmit` |
| 打包 zip（Chrome） | `pnpm zip` | |
| 打包 zip（Firefox） | `pnpm zip:firefox` | |
| 格式化 | `pnpm format` | `npx -y prettier --write .`（仅用户可用） |

## 重要约束

- **WXT 配置入口**：`wxt.config.ts`，目前加载 `@wxt-dev/module-react` 模块，已启用 `srcDir: 'src'` + `entrypointsDir: '.'`。
- **WXT 入口点约定**：`src/` 下的文件自动注册为扩展页面/脚本（`background.ts`、`content.ts`、`popup/`）。
- **使用 `@/` 导入**：`@/` 映射到 `src/` 目录（通过 WXT 的 `srcDir` 配置自动生成，tsc + 打包工具均解析正确）。
- **shadcn 已配置**（v4 + radix-nova 风格 + Tailwind v4），首次添加组件后如遇缺少依赖，运行 `pnpm add <包名>`。关于 shadcn 组件的最佳实践，见 [shadcn 组件策略](#shadcn-组件策略)。
- **「记下」= 写入 AGENTS.md**：当用户说「记下」「记一下」「记住」时，将对应的规则或约定追加到本文件，而不是仅靠上下文记忆。
- **组件注释约定**：每个 TSX 文件中的 JSX 区块前必须添加 `// ── 区名 ──` 注释，标注该区块对应的视觉区域。新增组件、新增区域时都要添加对应注释。
- **始终使用中文回复用户**：所有对话必须使用中文。
- **严格按用户说的范围执行**：用户要求的事才做，不要扩展范围、不要附加额外任务。
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
6. **文字尺寸用标准 Tailwind 尺寸**：`text-xs` / `text-sm` / `text-base` / `text-lg` / `text-xl` 等，不用 `text-[11px]` 这类任意值。
7. **添加新组件**：`npx shadcn@latest add <组件名>`。如果安装失败（超时），手动装 `@radix-ui/react-<primitive>` 并仿照 `src/components/ui/` 下已有组件手写。
8. **`@radix-ui/*` 包不需要单独装**——`radix-ui` 全量包已经包含所有 Radix primitive 的导出。

## 浏览器调试

- 扩展新标签页 URL: `chrome-extension://<id>/newtab.html`（WXT HMR 开发模式下有效，`<id>` 从 `chrome://extensions` 获取）。
