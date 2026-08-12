# Kanagawa Fishing Map — 开发记录

神奈川县及周边钓场地图。纯前端，无后端，数据为静态 JSON。

- 仓库：`github.com/HANNAH-OU/kanagawa-fishing-map`
- 记录截至：`7486842`（2026-08-12）

---

## 1. 最终状态

### 技术栈

| 层 | 选择 | 版本 |
|---|---|---|
| 框架 | React | 19.2.8 |
| 构建 | Vite | 8.2.1 |
| Lint | oxlint | 1.75 |
| 地图 | Leaflet | 1.9.4 |
| React 绑定 | react-leaflet | 5.0.0 |
| 底图 | 国土地理院 pale 瓦片 | — |

运行时依赖只有 4 个：`react` / `react-dom` / `leaflet` / `react-leaflet`。没有 UI 框架、没有状态管理库、没有 CSS 框架。

### 代码规模

```
src/App.css              723
src/data/spots.json      474
src/components/Map.jsx   400
src/components/SpotDetail.css  353
src/components/SpotCard.css    309
src/components/SpotDetail.jsx  157
src/App.jsx               89
src/components/SpotCard.jsx    57
src/typeStyles.js         51
src/index.css             43
src/components/SpotPhoto.jsx   42
src/components/Legend.jsx      29
src/main.jsx              10
─────────────────────────────
合计                    2737 行
```

构建产物 432 KB（JS gzip 118 KB / CSS gzip 10.6 KB）。

### 数据

20 个钓场，每条 16 个字段。

| 分类 | 数量 | 标记颜色 |
|---|---|---|
| 海釣り施設 / 堤防 / 磯 | 10 | 琥珀 `#F5B942` |
| 管理釣り場 | 10 | 薄荷绿 `#3FD39B` |

字段填充率：官网 13/20、营业时间 8/20、料金 4/20、鱼种 6/20。**未经核实的一律留空**，界面上对应区块不渲染。

---

## 2. 开发流程

### 阶段一 · 立项与选型

确认工作目录、确认目标目录不存在、确认非 git 仓库。

地图方案对比了四个候选：Leaflet+OSM、国土地理院+Leaflet、Google Maps JS API、MapLibre。选定**国土地理院瓦片**，理由是钓场多在堤防、河口、海岸线，GSI 对这些地形描绘最准，且免费无 key。事后证明这个选择还有一个额外好处：GSI 的 pale 图层色彩单一，便于后期用 CSS 滤镜整体改色。

### 阶段二 · 脚手架与依赖

`npm create vite@latest -- --template react` 得到的版本比预期新：React 19 + Vite 8 + oxlint（而非 ESLint）。因此 react-leaflet 必须用 v5——v4 的 peer 上限是 React 18。安装后验证了 peer dependency 与依赖树去重情况（`leaflet` 单实例，多实例会导致地图对象互不识别）。

### 阶段三 · 数据结构先行

先定 schema、只放 1 条测试数据（本牧海づり施設），再扩充。schema 从一开始就预留了 `photos` / `fishSpecies` / `fee` / `facilities` 四个扩展位并留空，组件用条件渲染——后续填数据时组件几乎不用改。

### 阶段四 · 数据核实

这是耗时占比很高、但价值最高的一段。原则是**不确定的信息不填**。

核实手段分两类：

**属性信息**（料金、交通、设备、营业时间）——只采信政府或运营方官网，逐个 fetch 页面确认：

- 横浜市「横浜フィッシングピアーズ」页 → 本牧 / 大黒 / 磯子 的官方料金与巴士路线
- 川崎市 東扇島西公園 页 → 停车场容量与收费、巴士系统
- 各管理釣り場官网 → 逐个 `curl` 检查 HTTP 200 且 `<title>` 或页内住所与设施名一致

其中 `yokohama-fishingpiers.jp` 返回 200 但内容由 JS 渲染，无法确认归属，**未采用**。忍野フィッシングエリア只找到村观光协会页面而非设施官网，`officialUrl` 留空。

**坐标**——用两条独立管道交叉验证：

1. 国土地理院地址检索 API（`msearch.gsi.go.jp/address-search`）
2. OpenStreetMap Nominatim（按设施名）

两者互补：GSI 对「番地」级地址精确，但很多山区住所只能匹配到大字中心点；Nominatim 有 POI 数据，能直接命中设施本体。

这一步抓到两个如果凭印象填就会犯的错：

- Nominatim 搜「道志川渓流フィッシングセンター」返回的是**秩父的浦山渓流フィッシングセンター**（名字相近的另一家），已排除
- GSI 对「青根3769-1」和「青根3685」返回**完全相同的大字中心点**，两个不同钓场会重叠成一个点，改用 Nominatim 分别定位

最终每个坐标的精度分三档记录：设施级 POI（6 处）、番地级（1 处）、大字级（2 处）。道志川渓流フィッシングセンター只能拿到村级中心点，已明确标注需人工核对。

### 阶段五 · 视觉迭代

前后经历七轮，由用户提供的六张参考图驱动：

| 轮次 | 方向 | 触发 |
|---|---|---|
| V1 | 基础地图 + Leaflet Popup | — |
| V2 | 详情面板：桌面侧栏 / 手机抽屉 | — |
| V3 | Glassmorphism + 类型配色 + 图例 | — |
| V4 | 米色纸感编辑排版 | `02-map-style.png` |
| V5 | 深海青 + 荧光绿 + 撕纸卡片 | `01` / `03` / `04` |
| V6 | 深夜蓝地图 + 琥珀灯标 | `05map-color-style.png` |
| V7 | 冷蓝辉光区域名 | `06map-area-style.png` |

中途也走了弯路：V4→V5 之间做过一版青色玻璃拟态，与后来的纸感方向完全相反，等于推倒重来。**如果参考图能在动手前一次性给齐，能省掉大约两轮返工。**

### 阶段六 · 交互重构

底部常驻的横向卡片列表（SpotCarousel）改为「点击标记 → 锚定弹出卡 → 詳細 → 完整面板」的两段式。SpotCarousel 组件随之删除。

### 阶段七 · 手机端适配

在 `@media (max-width: 767px)`、`@media (pointer: coarse)`、`env(safe-area-inset-*)` 三类条件内完成，桌面端零改动。

---

## 3. 踩过的坑

这一节是本项目最值得留存的部分。

### 3.1 Leaflet 默认图标在 Vite 下 URL 被污染

**现象**：Marker 完全不显示，DOM 里元素存在但看不见。

**原因**：`Icon.Default._getIconUrl` 的实现是

```js
return (this.options.imagePath || IconDefault.imagePath) + Icon.prototype._getIconUrl.call(this, name)
```

注意那个 `+`——它把自动探测出的 `imagePath` **拼接**在 `options.iconUrl` 前面，而不是替换。而 Vite 已经把图标内联成了 base64 data URI，于是最终 src 变成两段 data URI 首尾相接的畸形字符串。

**修复**：覆盖 `_getIconUrl`，让它直接返回配置值。

**教训**：这个 bug 的表现是「什么都没有」，最容易被误判为「数据没加载」或「坐标错了」。定位靠的是读 `leaflet-src.js` 源码，而不是猜。

### 3.2 数据结构变更引发 React 崩溃

把 `fishSpecies` 从 `string[]` 改成 `{name, season}[]` 时，渲染层仍是 `<li>{fish}</li>`，React 抛 **"Objects are not valid as a React child"**，整页白屏。

**教训**：改数据结构和改渲染层必须同一次提交完成。当时因为「只改数据不改 React 文件」的约束而分两步做，中间态是崩溃的——这种情况下应当先明确指出冲突，而不是留一个已知会崩的状态。

### 3.3 `.leaflet-map-pane` 的层叠上下文

**现象**：想让蒙层「压暗底图但不压暗标记」，用 `z-index: 300` 的容器级伪元素，结果整张图（含标记）一起变暗。

**原因**：Leaflet 给 `.leaflet-map-pane` 施加 `transform: translate3d()` 用于平移，**transform 会创建独立层叠上下文**。于是所有 pane（tile 200 / marker 600）都被封在里面，容器级伪元素的 z-index 与它们不在同一个比较层级，只能整体压在上面或下面。

**修复**：变暗和打光都必须做成 Leaflet 图层（`<Pane>` + `<Polygon>` / `<SVGOverlay>`），而不是 CSS 蒙层。

**教训**：我最初的判断是错的，并且基于这个错误判断做了两轮无效调整。转折点是回头验证「为什么蒙层没有按预期分层」，而不是继续调数值。

### 3.4 区域高亮：三次尝试

目标是「深色地图上的三块浅色区域」，且不能看出边界。

1. **多边形填充 + 边框** → 像贴纸，边界刺眼
2. **带孔洞的遮罩（even-odd）+ 17px 模糊羽化** → 仍然是「一个被模糊的多边形」，边缘依旧可辨
3. **均匀遮罩 + 每区域一个 SVG 径向渐变 + `mix-blend-mode: screen`** → 成功

关键认知：**模糊一个形状 ≠ 没有形状**。前两次的底层都是多边形，无论怎么羽化都存在一条「形状的边」。第三次让形状只负责计算一个外接框，视觉完全由径向渐变承担——渐变在边缘处 alpha 本来就是 0，**根本不存在边可看**。

用 `screen` 混合而非叠加半透明色，是为了「加光」而不是「冲淡」——后者会等比压掉底图对比度，产生贴纸感。

### 3.5 `env(safe-area-inset-top)` 在 border-box 下的陷阱

```css
.topbar {
  height: 52px;
  padding-top: env(safe-area-inset-top);  /* iPhone 上约 47–59px */
}
```

全局 `box-sizing: border-box` 时，内边距是**从 52px 里扣**的——刘海屏上内容区被压到接近 0，Logo 和标题直接消失。

**修复**：`height: calc(52px + env(safe-area-inset-top))`，把安全区加到高度上。

### 3.6 百分比 `line-height` 的继承行为

`:root { font: 16px/145% }` —— 百分比行高**在声明它的元素上**计算成固定长度（16 × 1.45 = 23.2px），然后以该固定值向下继承。结果是 9px 的小标签也占着 23.2px 的行框。

这在 Hero 面板里白白浪费了约 28px 高度。修复是在需要的元素上显式设 `line-height` 数值（无单位数值才会按各自字号重算）。

### 3.7 道路弱化：对比度是等比的

想「压暗道路但保留海岸线」时，第一反应是降 `contrast`——但对比度对所有色阶等比缩放，压道路的同时把陆海边界也压没了。

有效的手段是 **`blur(0.5px)`**：道路是 1px 细线，亚像素模糊会吃掉它大部分振幅；海面陆地是大色块，几乎不受影响。

---

## 4. 关键技术方案

### 4.1 夜航海图底图

GSI 没有暗色底图，用 CSS 滤镜链改造 pale 图层：

```css
filter: grayscale(1) invert(1) brightness(0.56) contrast(0.72)
        blur(0.65px) sepia(1) hue-rotate(176deg) saturate(1.9);
```

顺序有讲究：

- `grayscale(1)` 打头 —— 抹掉公园绿地等分类色，这是「不要绿色区域」的根本解法
- `invert(1)` —— 白色陆地沉到黑，浅蓝海面反相后**比陆地亮一档**，正好是海图的明暗关系
- `blur` —— 针对性弱化道路（见 3.7）
- `sepia + hue-rotate + saturate` —— 染成深蓝

### 4.2 图层深度

```
600  钓鱼标记（灯标）      ← 唯一穿透暗角
500  暗角
450  区域名文字
340  区域辉光（screen 混合）
320  均匀深蓝遮罩
240  —
200  底图：道路 · 地名 · 地形
```

四层视觉次序（标记 > 区域 > 地图 > 道路）不是靠调透明度堆出来的，而是靠图层深度**结构性**保证的。

### 4.3 单一数据源

`typeStyles.js` 同时导出颜色和 SVG 图标字符串。图标之所以是字符串而非 React 组件，是因为 Leaflet 的 `divIcon` 只接受 HTML；React 侧用 `dangerouslySetInnerHTML` 注入同一份常量。这样地图标记、图例、卡片占位图三处永远一致，改一处不会漏掉另外两处。

### 4.4 触控目标

灯标只有 14px。在 `@media (pointer: coarse)` 下用 `::before` 伪元素给它加一个 40px 的隐形命中框——伪元素属于宿主元素的命中区域，外观零变化。

没用 44px（Apple HIG 推荐值）是因为城ヶ島和剣崎在默认缩放下仅相距约 20px，框太大会互相抢点击。

---

## 5. 遗留问题

| 项 | 状态 |
|---|---|
| 页面最右侧黑色竖条 | **未定位**。已排除若干可能（容器测量竞态、滚动条、横向溢出），诊断脚本已交付，等待浏览器控制台输出 |
| 运行时 console error | **未检查**。本机只有 Safari，无法运行无头浏览器 |
| 道志川渓流フィッシングセンター 坐标 | 仅村级中心点，需人工核对 |
| 12 个钓场缺料金/设备/营业时间 | 待核实后补充 |
| git 提交者身份 | 自动推断的本机主机名，GitHub 无法关联账号 |

---

## 6. 如果重来一次

1. **参考图先给齐**。七轮视觉迭代里至少两轮是方向性返工，起因是参考图分批出现，后一批与前一批风格相反。
2. **数据核实的投入是值得的**，但应该在录入前一次做完。本项目是「先录 10 条 → 再核实 → 再扩到 20 条 → 再核实」，同一套流程跑了两遍。
3. **改数据结构和改渲染层不要拆成两次提交**，中间态会崩。
4. **遇到「明明设了 z-index 却不生效」，先查有没有 transform / filter / opacity 创建了层叠上下文**，不要调数值。
