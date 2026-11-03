# DevToolbox · 开发者工具箱

基于 Vue 3 + Vite 的工具箱站点，当前落地 JSON 格式化 / 压缩 / 转义与常用编码工具。

## 快速开始

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # 产物在 dist/，base 为相对路径，可直接丢任意静态服务器
npm run preview
```

## 目录结构

```
src/
├── main.js                     入口
├── App.vue                     应用外壳：左导航 + 右内容
├── router/index.js             路由（hash 模式，静态部署不 404）
├── config/
│   ├── tools.js                工具注册表：名称/文案/示例/transform 逻辑
│   └── navigation.js           二级导航结构，名称统一从 tools 取
├── composables/
│   ├── useNavigation.js        分组折叠状态（localStorage 持久化）
│   └── useClipboard.js         复制到剪贴板（含兜底）
├── utils/
│   ├── json.js                 解析 + 原生报错转行列定位
│   ├── highlight.js            JSON 语法高亮（先转义再着色）
│   ├── text.js                 HTML 转义
│   ├── encode.js               UTF-8 安全的 Base64
│   ├── xml.js                  JSON ⇄ XML 互转（@attr / #text / 数组约定）
│   └── color.js                HEX ⇄ RGB ⇄ HSL 换算与格式解析
├── components/
│   ├── layout/AppSidebar.vue   侧边栏容器
│   ├── layout/NavGroup.vue     一级分组 + 二级项
│   ├── tool/ToolHeader.vue     面包屑 + 标题 + 描述
│   ├── tool/InputPanel.vue     输入区（含实时校验徽标、快捷键）
│   ├── tool/OutputPanel.vue    输出区（高亮 / 行号 / 空态 / 复制）
│   ├── tool/ErrorNotice.vue    错误提示（行列 + 出错字符标红）
│   └── ui/                     AppButton、StatusBadge
└── views/
    ├── ToolView.vue            通用工具页，按路由参数取工具
    ├── ColorView.vue           颜色转换专属页（拾色器 + 表单联动）
    └── NotFoundView.vue
```

## 状态管理约定

| 状态 | 归属 | 说明 |
| --- | --- | --- |
| 当前选中工具 | 路由 `route.params.toolId` | 唯一来源，不用额外 store |
| 分组折叠 | `useNavigation`（模块级单例） | 写 localStorage，刷新保持 |
| 输入 / 输出 / 错误 | `ToolView` 局部 `ref` | 随工具页生命周期 |

导航选中态刻意不做成全局状态，避免和路由两处记录导致不同步。若后续要加收藏、最近使用等功能，把 `useNavigation` 整体平移成 Pinia store 即可，调用方无需改动。

## 新增一个工具

只需编辑 `src/config/tools.js` 加一条，再到 `src/config/navigation.js` 的分组 `items` 里放上它的 id：

```js
'json-decode': {
  id: 'json-decode',
  name: 'JSON 解码',
  desc: '把转义字符串还原成 JSON',
  action: '解码',
  lang: 'json',              // json 走高亮，text 走纯文本
  placeholder: '粘贴转义字符串',
  sample: '"{\\"a\\":1}"',
  transform: (text) => JSON.stringify(JSON.parse(JSON.parse(text)), null, 2),
}
```

`transform` 抛出的原生 `SyntaxError` 会被自动转成「解析失败 + 第 N 行第 M 列」提示，不需要额外写错误处理。

### 双向工具（编码 / 解码）

同一个工具要支持正反两个方向时，不用拆成两个导航项，加一个 `modes` 数组即可：

```js
'encode-base64': {
  // …其余字段同上，transform 作为兜底
  defaultMode: 'encode',
  modes: [
    { key: 'encode', label: '编码', sample: '你好，老板',     transform: (t) => base64Encode(t) },
    { key: 'decode', label: '解码', sample: '5L2g5aW977yM6ICB5p2/', transform: (t) => base64Decode(t) },
  ],
}
```

配置了 `modes` 后，输入区顶部自动出现「编码 / 解码」切换，主按钮文案跟随当前方向，每个方向还各有自己的示例内容。只有一个方向时省略 `modes` 即可，行为和原来一致。

## 字号整体调整

所有字号集中在 `src/styles/tokens.css` 的 `--fs-*` 一组变量里，改一处即可全站生效：

```css
--fs-base: 15px;   /* 正文 */
--fs-title: 21px;  /* 页面主标题 */
--fs-code: 14.5px; /* 输入框 / 代码区 / 行号 */
--fs-nav: 14px;    /* 导航二级项 */
--fs-sm: 13px;
--fs-xs: 12px;
```

字号继续调大时，记得同步 `--sidebar-w`（当前 284px），否则长标签会显得拥挤。

## 交互约定

- `Ctrl / ⌘ + Enter` 执行当前工具
- 输入内容变化后，上一次的结果会被清空，避免看到过期输出
- 实时校验对超过 200KB 的文本自动关闭，防止输入卡顿
- 窄屏（≤960px）下导航移到顶部，输入与输出改为上下堆叠
