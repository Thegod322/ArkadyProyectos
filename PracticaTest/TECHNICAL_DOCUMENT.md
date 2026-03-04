# ArkCanvas — MDD Graph Editor
## Technical Design Document
**Version:** 0.3.1  
**Date:** March 3, 2026  
**Status:** Design Phase  
**Approach:** Pure Web App (WebGL2)

---

## 1. Vision & Goals

Build an ultra-lightweight graph/canvas editor designed around the **MDD (Modular Development Documentation)** philosophy: the graph is a **semantic model first**, a visual tool second. The graph format is split so that an LLM agent can read the pure connection model without visual noise, while the user gets a full visual canvas experience.

### 1.1 Design Principles

1. **Model-first** — The graph is a mathematical model of connections. Positions are secondary metadata.
2. **LLM-readable** — The core graph file (`graph.mdd.json`) contains ONLY semantic data: nodes, edges, colors, groups. No coordinates. An LLM can ingest it directly as project context.
3. **Ultra-light** — 0% CPU when idle. WebGL2 batched rendering. No DOM for canvas elements.
4. **Two node paradigms** — Normal Nodes (no title bar, two-column ports, content) and Loop Nodes (minimal, center-connected boxes).
5. **Groups as metadata** — No separate group nodes. Groups are a property on nodes, and the renderer draws group visuals from that metadata.

### 1.2 Core Features
| Feature | Description |
|---|---|
| Infinite Canvas | Pan/zoom with no boundaries, smooth at any scale |
| Normal Nodes | Content nodes with two-column ports (in/out) that auto-grow independently |
| Loop Nodes | Minimal title-only boxes with center-anchored connections |
| Connections | Directed edges between ports (Normal) or centers (Loop) |
| Metadata Groups | Groups defined as node metadata; renderer draws group boundaries |
| Color Legend | Semantic color coding system (entity, action, service, etc.) |
| Split Format | `graph.mdd.json` (semantic) + `positions.mdd.json` (visual) |
| Autolayout | Popularity-based tree layout; auto-positions nodes when LLM edits or topology is parsed |
| Minimap | Overview navigation for large graphs |
| Search | Instant full-text search across all nodes |
| Import/Export | MDD JSON, Obsidian Canvas import|
| Undo/Redo | Full undo/redo history stack |
| Keyboard-first | Complete keyboard navigation and shortcuts |

---

## 2. Why a Web App Works — Proof

### 2.1 Existing Products That Prove It

| Product | Complexity | How |
|---|---|---|
| **Figma** | Thousands of vector layers, effects, real-time collab | WebGL + C++→WASM |
| **tldraw** | Infinite canvas, thousands of shapes | Canvas2D |
| **Excalidraw** | Whiteboard with millions of users | Canvas2D |
| **Miro** | Millions of objects per board | WebGL |

### 2.2 The Key Insight

```
SLOW:  HTML DOM → 10,000 <div> elements → LAG
FAST:  WebGL2 → GPU-accelerated → 60fps, bypass DOM entirely
```

| Technology | What it gives us |
|---|---|
| **WebGL2** | Direct GPU access, custom shaders, batch rendering |
| **WebAssembly (WASM)** | Rust/C++ at ~95% native speed in the browser |
| **OffscreenCanvas** | Render on a Web Worker, zero main-thread blocking |
| **requestAnimationFrame** | Vsync-locked frame loop, smooth 60fps |

### 2.3 Performance Expectations

| Scenario | DOM | WebGL2 |
|---|---|---|
| 1,000 nodes | 30fps | 60fps |
| 10,000 nodes | 5fps | 60fps |
| 50,000 nodes | crash | 55fps+ |

---

## 3. Tech Stack — Pure Web App

```
TypeScript + WebGL2 (custom renderer) + Rust→WASM
```

| Aspect | Details |
|---|---|
| **Language** | TypeScript (app logic) + Rust (heavy paths → WASM) |
| **Rendering** | Custom WebGL2 renderer (no framework overhead) |
| **State** | Zustand (~1KB) — minimal, no boilerplate |
| **Spatial Index** | Quadtree in Rust/WASM |
| **Threading** | Web Workers for layout, OffscreenCanvas |
| **Bundle Size** | < 200KB gzipped |
| **Distribution** | URL. Zero install. |
| **Offline** | Service Worker → full PWA |
| **Build** | Vite + wasm-pack |
| **Testing** | Vitest + Playwright |

---

## 4. Node System — The Two Paradigms

This is the heart of the editor. There are exactly **two types of nodes**, each with fundamentally different structure and behavior.

### 4.1 Normal Node

The workhorse node. Designed for structured, relational content.

**There is NO separate title bar.** The `text` (title) and `content` are separate data fields, but visually they render in the same area with no divider — the title displays as the first line of the node body, with content below it. This keeps the node compact and uniform.

Ports are arranged as **two columns on the same rows** — inputs on the left, outputs on the right. Adding a new input only grows the input column; you do NOT have to add a port on both sides. Each column grows independently.

```
┌─────────────────────────────────────┐
│                               [color]│
│  Character                          │  ← Title (first line, same area)
│  Main playable character stats      │  ← Content (text or file ref)
│                                     │
│  INPUT PORTS     │   OUTPUT PORTS   │  ← Two-column port layout
│  ● game          │   inventory ●    │  ← Same row, independent columns
│  ● quest         │   skills    ●    │
│  ●               │              ●   │  ← Auto-added empty ports
└─────────────────────────────────────┘
```

**Behavior rules:**

| Rule | Description |
|---|---|
| **No title bar** | `text` (title) and `content` are separate fields in the data model but render in the same visual area with no divider. Title displays first, content below. |
| **Content** | `contentType: "text"`: plain text displayed inline. `contentType: "file"`: the `content` field holds a file path; the node displays the filename as a clickable reference. |
| **Two-column ports** | Input ports (left column) and output ports (right column) sit on the same rows. Each column grows independently. |
| **Independent growth** | Adding a new input connection only adds a port on the input side. The output column is unaffected, and vice versa. |
| **Dynamic port creation** | When a connection is made to an input port, a new empty input port auto-appears below in the input column. Same for outputs in the output column. |
| **Port label = connected node name** | Next to each connected port, the **title of the connected node** is displayed. E.g., if "Game" connects to "Character", the Character node shows "game" near that input port. |
| **Disconnection** | Removing a connection removes the port label. If the port is now the last empty one, it stays. Extra empty ports beyond one are cleaned up. |
| **Port ordering** | Ports maintain insertion order. User can reorder via drag. |

**Port auto-grow logic (two-column, independent):**
```
INITIAL STATE:
  ● empty       │       empty ●

AFTER connecting "Game" → "Character" (input):
  ● game        │       empty ●      ← only input column grew
  ● empty       │

AFTER connecting "Character" → "Inventory" (output):
  ● game        │   inventory ●      ← only output column grew
  ● empty       │       empty ●

AFTER connecting "Quest" → "Character" (input):
  ● game        │   inventory ●      ← only input column grew again
  ● quest       │       empty ●
  ● empty       │
```

### 4.2 Loop Node

A minimal, abstract connector. Designed for concepts that act as **hubs** or **loops** — things that many nodes reference but that don't hold detailed content.

```
                    ●  ← connections attach to center
                    │
        ┌───────────┼───────────┐
        │           │           │
    ● ──┤     Loop Title       ├── ●
        │                       │
        └───────────┬───────────┘
                    │
                    ●  ← connections attach to center
```

**Behavior rules:**

| Rule | Description |
|---|---|
| **No visible ports** | No port list, no port rows. Clean box with content only. |
| **Center-anchored connections** | All edges (input AND output) connect to the geometric center of the node |
| **Title only** | The node displays only its title text. No content area. |
| **Use case** | Represents abstract concepts, loops, recurring themes, shared dependencies |
| **Edge routing** | The renderer routes edges to/from the center point, fanning out to avoid overlap |

### 4.3 Visual Comparison

```
NORMAL NODE (no title bar)            LOOP NODE
┌──────────────────────┐              ┌──────────────┐
│ Character       [🔴] │              │  Gameplay    │
│ Main playable        │              │   Loop       │
│ character stats      │              └──────────────┘
│                      │                   ╱ | ╲
│ ● game   │ invent. ● │                  ╱  |  ╲
│ ● quest  │ skills  ● │              edges fan out
│ ●        │         ● │              from center
└──────────────────────┘
     ↑                                     ↑
  No title bar,                       Minimal,
  2-column ports                      hub connector,
  (left=in, right=out)               no ports visible
  each column grows
  independently
```

---

## 5. Group System — Metadata, Not Nodes

### 5.1 The Problem with Obsidian's Approach

In Obsidian Canvas, groups are **separate nodes** — a big rectangle you drag nodes into. This creates problems:
- Groups are objects in the graph data, polluting the semantic model
- Moving groups is clunky
- Groups fight with the node hierarchy
- LLM reading the graph sees "group nodes" that aren't real entities

### 5.2 Our Approach: Groups as Node Metadata

Groups are a **property on each node**, not separate entities. The renderer draws group visuals by aggregating nodes with the same group tag.

```typescript
// Group lives INSIDE the node, not as a separate object
interface MDDNode {
  id: string;
  text: string;
  type: "normal" | "loop";
  color: string;       // color code from legend
  group?: string;      // ← group is just a tag
  content?: string;    // only for normal nodes
}
```

### 5.3 How Rendering Works

```
DATA:
  Node A { group: "combat" }
  Node B { group: "combat" }
  Node C { group: "UI" }
  Node D { group: null }       ← no group

RENDERER:
  1. Collect all unique group tags from visible nodes
  2. For each group:
     a. Find bounding box of all member nodes (with padding)
     b. Draw a semi-transparent rounded rectangle behind them
     c. Draw group label at the top of the bounding box
  3. Group color = derived from first member's color, or configurable

RESULT:
  ┌─── combat ──────────────────────┐
  │  ┌─────────┐   ┌─────────┐     │
  │  │ Node A  │   │ Node B  │     │
  │  └─────────┘   └─────────┘     │
  └─────────────────────────────────┘

  ┌─── UI ───────────┐
  │  ┌─────────┐     │      ┌─────────┐
  │  │ Node C  │     │      │ Node D  │  ← ungrouped, no box
  │  └─────────┘     │      └─────────┘
  └──────────────────┘
```

### 5.4 Advantages

| Advantage | Detail |
|---|---|
| **Clean graph model** | No phantom "group nodes" in the data |
| **LLM-friendly** | Group is a simple tag, easily understood by agents |
| **Dynamic rendering** | Group boundaries recalculate automatically as nodes move |
| **Multi-group** | Currently `group?: string` (single group). Future: array of tags for multi-group membership. |
| **Cheap to change** | Reassigning a group = change one string property |

---

## 6. MDD Format — Split Serialization

### 6.1 The Split Philosophy

The graph is saved as **two separate files**:

| File | Contains | Who reads it |
|---|---|---|
| `graph.mdd.json` | Nodes, edges, colors, groups — the **semantic model** | LLM agents, CI/CD, analysis tools, humans |
| `positions.mdd.json` | Node positions, sizes, viewport — **visual layout only** | Only the graph editor |

**Why?** Because when an LLM agent reads your project graph, it needs to understand:
- What entities exist (nodes)
- How they connect (edges)
- What category they are (colors)
- How they're grouped (group tags)

It does NOT need to know that "Node A is at pixel 1600,425 with size 371x115". That's noise for an AI.

### 6.2 `graph.mdd.json` — The Semantic Model

```json
{
  "version": "1.0",
  "color_legend": {
    "0": "Grey — Reference to variable or info block (no color)",
    "1": "Red — Entity / Class / Page",
    "2": "Orange — External services and APIs",
    "3": "Yellow — Data / Model / Schema",
    "4": "Green — Action / Button / Transition",
    "5": "Blue — Abstract entity",
    "6": "Purple — Technical specifications"
  },
  "nodes": [
    {
      "id": "57402da901af3a62",
      "text": "Character",
      "type": "normal",
      "color": "1",
      "group": "game_entities",
      "content": "Main playable character with stats and inventory"
    },
    {
      "id": "01c3ba8602fd215d",
      "text": "Programming",
      "type": "normal",
      "color": "4",
      "group": "actions"
    },
    {
      "id": "a8f3201bc9de4567",
      "text": "Gameplay Loop",
      "type": "loop",
      "color": "5",
      "group": "core"
    }
  ],
  "edges": [
    {
      "id": "e001",
      "source": "01c3ba8602fd215d",
      "target": "57402da901af3a62",
      "color": "0",
      "label": "develops"
    },
    {
      "id": "e002",
      "source": "a8f3201bc9de4567",
      "target": "57402da901af3a62",
      "color": "1",
      "label": "involves"
    }
  ]
}
```

**Properties of this format:**
- **No positions, no sizes, no viewport** — pure semantic data
- **Human-readable** — you can review it in any text editor
- **Git-friendly** — clean diffs when nodes/edges change
- **LLM-ingestible** — paste into context window, agent understands the project structure instantly
- **Color legend at the top** — self-documenting, agent knows the color semantics
- **Edges have `color` and `label`** — edge `color` uses the same legend codes as nodes; autolayout uses color to distinguish structural (color 0) vs functional (color 1+) edges (see Section 6.6)
- **Node IDs are hex strings** — compatible with Obsidian Canvas ID format

### 6.3 `positions.mdd.json` — The Visual Layout

```json
{
  "version": "1.0",
  "viewport": {
    "center": [800, 600],
    "zoom": 1.0
  },
  "node_positions": {
    "57402da901af3a62": {
      "position": [1600.0, 425.99],
      "size": [371.0, 215.0]
    },
    "01c3ba8602fd215d": {
      "position": [800.0, 300.0],
      "size": [250.0, 115.0]
    },
    "a8f3201bc9de4567": {
      "position": [1200.0, 500.0],
      "size": [160.0, 80.0]
    }
  },
  "edge_waypoints": {
    "e001": [[1000.0, 350.0]],
    "e002": []
  }
}
```

**Properties:**
- **Keyed by node ID** — links to `graph.mdd.json` via shared IDs
- **Contains only visual data** — positions, sizes, edge bend points, viewport
- **Can be regenerated** — if lost, the editor can auto-layout from the graph model
- **Not needed by LLM** — agent never reads this file
- **Smaller diffs** — moving nodes doesn't dirty the semantic graph file

### 6.4 How They Work Together

```
┌────────────────────┐     ┌──────────────────────┐
│  graph.mdd.json    │     │ positions.mdd.json   │
│                    │     │                      │
│  nodes: [          │     │  node_positions: {   │
│    { id: "abc",    │◄────│    "abc": {          │
│      text: "Game", │  ID │      position: [...] │
│      type: "normal"│ link│      size: [...]     │
│    }               │     │    }                 │
│  ]                 │     │  }                   │
│  edges: [...]      │     │  viewport: {...}     │
└────────────────────┘     └──────────────────────┘
        │                            │
        ▼                            ▼
   LLM reads this              Editor uses both
   for context                 to render canvas
```

### 6.5 MDD Types & LLM Integration

There are multiple types of MDD documents:

| MDD Type | Description | Created by |
|---|---|---|
| **Topology MDD** | Auto-generated graph that represents the **structural topology** of a project — classes, functions, files, their relationships. Works like a "zip archive" of the repository compressed into a graph of nodes and edges. | Scripts that parse the codebase |
| **Hand-crafted MDD** | Manually authored graphs for design, planning, or documentation. | Human |
| **LLM-crafted MDD** | Graphs generated or extended by an LLM agent during a conversation. | LLM |

**Topology MDD** is the most common type. Dedicated scripts scan a repository folder and compress the code structure into an MDD graph — every function, class, module, and their call/dependency relationships become nodes and edges. This gives the AI agent a complete, navigable map of the project (can be **10,000+ nodes** for large codebases).

**LLM interaction with MDD:**

- The AI agent **can read and modify** `graph.mdd.json` — adding nodes, removing edges, restructuring groups.
- However, **most MDD graphs are auto-generated topology** that the AI reads as project context, not something it authored from scratch.
- The AI **never provides coordinates**. When the LLM modifies the graph, the editor's **autolayout system** (see Section 6.6) automatically positions all nodes.

```
Workflow — Topology MDD:

  Repository folder
       │
       ▼
  [Compression scripts]  →  graph.mdd.json (topology)
       │                     (classes, functions, calls)
       ▼
  AI agent reads topology as project context
       │
       ▼
  Editor loads modified graph.mdd.json
  Autolayout engine positions all nodes automatically
  User can fine-tune positions if desired
```

```
Workflow — LLM-crafted MDD:

"Here is the MDD graph for my project:
<graph>
{contents of graph.mdd.json}
</graph>

Based on this modular documentation, add a new feature for 'Authentication'
connected to 'User' and 'API Gateway'."

→ LLm reads the context and starts working with its weights and attention tuned to produce good production ready code
```

### 6.6 Autolayout System — Popularity-Based Tree Layout

When the LLM adds or modifies nodes, it works with `graph.mdd.json` only — it does **not** know or provide coordinates. The autolayout engine generates positions automatically from the graph structure. This is also critical when parsing **topology MDDs** of large projects (10,000+ nodes), where manual positioning is impossible.

Autolayout runs:
- Every time the LLM modifies the graph
- Every time a topology MDD is parsed/imported
- On user request (manual trigger)

#### 6.6.1 Core Rules

| Rule | Description |
|---|---|
| **1. Tree structure** | The graph is always treated as a tree for layout purposes. |
| **2. Edge color semantics** | Each edge has a `color` field (same codes as node colors). **Color 0** = architectural/structural (e.g., class → child function). **Color 1** = functional/call (e.g., function A calls function B). Autolayout builds the tree from color-0 edges only; color-1+ edges are rendered but don't affect layout. |
| **3. Direction** | Layout flows from **top-left to bottom-right**. Parent nodes are to the left; children extend to the right and downward. |
| **4. Children column** | Child nodes of a parent are arranged in a **vertical column to the right** of the parent. |
| **4.1 First child alignment** | The first child node has the **same Y (height) as its parent**. The second child and all subsequent children are placed below the first child. |
| **4.2 Dynamic spacing** | The vertical space between children depends on **how many descendants (sub-children) each child has**. A child with many sub-children gets more space below it so its subtree doesn't overlap the next sibling. |
| **4.3 Popularity offset** | If a node has many connections (high "popularity"), each connection **pushes the node further to the right**. Since children calculate their X position relative to the parent, all descendants shift accordingly. This prevents all nodes from being aligned in a single vertical column and creates a **functional, spread-out representation** of the project. |
| **5. Root selection** | For each connected component of color-0 edges, the root is the node with **no incoming** architectural edges. If multiple candidates exist, pick the one with the most descendants. Disconnected components are laid out independently, stacked vertically. |

#### 6.6.2 Layout Algorithm — Visual Example

```
Rule 4.1 + 4.2: Children column with dynamic spacing

parent
├── child1             ← same Y as parent
│   ├── sub-child 1
│   ├── sub-child 2
│   └── sub-child 3
├── child2             ← placed below child1's subtree (enough space for 3 sub-children)

Visual:
  [parent] ──── [child1] ──── [sub-child 1]
                    │          [sub-child 2]
                    │          [sub-child 3]
                    │
                 [child2]      ← Y offset accounts for child1's 3 descendants
```

```
Rule 4.3: Popularity offset (connections push node right)

Node A has 1 connection   → base X offset from parent
Node B has 5 connections  → pushed further right (5× popularity factor)
Node C has 12 connections → pushed even further right

Visual (without popularity):          Visual (with popularity):

  [root]─[A]                           [root]─[A]
         [B]     ← all same X                ────[B]        ← pushed right
         [C]                                    ────────[C]  ← pushed further right

Result: instead of a flat column, the tree spreads out based on
functional importance, giving a meaningful visual topology.
```

#### 6.6.3 Pseudocode

```typescript
interface LayoutConfig {
  baseOffsetX: number;       // horizontal gap between parent and children column
  baseOffsetY: number;       // vertical gap between sibling nodes
  popularityFactor: number;  // extra X pixels per connection
}

function autolayout(graph: GraphRuntime, config: LayoutConfig): void {
  // Build tree from architectural (color-0) edges only
  const tree = buildTreeFromArchitecturalEdges(graph);

  // Rule 5: find roots (nodes with no incoming architectural edges)
  const roots = findRoots(tree);

  // Layout each connected component, stacked vertically
  let globalY = 0;
  for (const root of roots) {
    const height = layoutSubtree(tree, root, { x: 0, y: globalY }, config, graph);
    globalY += height + config.baseOffsetY * 2;
  }
}

function layoutSubtree(
  tree: TreeStructure,
  nodeId: NodeId,
  origin: Vec2,
  config: LayoutConfig,
  graph: GraphRuntime
): number {  // returns total height consumed by this subtree

  const node = graph.nodes.get(nodeId)!;

  // Rule 4.3: popularity offset — connections push node right
  const connectionCount = countAllConnections(nodeId, graph);
  const popularityOffset = connectionCount * config.popularityFactor;

  node.position = {
    x: origin.x + popularityOffset,
    y: origin.y
  };

  const children = tree.getChildren(nodeId);
  if (children.length === 0) {
    return node.size.y;  // leaf node, just its own height
  }

  // Rule 4: children in column to the right
  const childX = node.position.x + node.size.x + config.baseOffsetX;
  let currentY = origin.y;  // Rule 4.1: first child same Y as parent

  for (const childId of children) {
    const subtreeHeight = layoutSubtree(tree, childId, { x: childX, y: currentY }, config, graph);
    currentY += subtreeHeight + config.baseOffsetY;  // Rule 4.2: spacing depends on subtree size
  }

  return currentY - origin.y;  // total height of this subtree
}
```

---

## 7. Architecture

### 7.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer (HTML)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │ Toolbar  │  │ Minimap  │  │ Property │  │ Context    │ │
│  │          │  │ (Canvas) │  │ Panel    │  │ Menu       │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    WebGL2 Rendering Engine                  │
│  ┌────────────┐ ┌────────────┐ ┌──────────────────────┐   │
│  │ Normal     │ │ Loop       │ │ Group Boundary       │   │
│  │ Node       │ │ Node       │ │ Renderer             │   │
│  │ Renderer   │ │ Renderer   │ │ (from metadata)      │   │
│  └────────────┘ └────────────┘ └──────────────────────┘   │
│  ┌────────────┐ ┌────────────┐ ┌──────────────────────┐   │
│  │ Port       │ │ Edge       │ │ Grid + Selection     │   │
│  │ Renderer   │ │ Renderer   │ │ Overlay              │   │
│  └────────────┘ └────────────┘ └──────────────────────┘   │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Text Atlas (SDF) — all text in 1 draw call            │ │
│  └───────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                     Core Engine                             │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐ │
│  │ Scene Graph│  │ Camera     │  │ Input Manager        │ │
│  │ (Quadtree) │  │ (Pan/Zoom) │  │ (Mouse/Touch/Keys)   │ │
│  └────────────┘  └────────────┘  └──────────────────────┘ │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐ │
│  │ Port       │ │ Command    │ │ Autolayout Engine    │ │
│  │ Manager    │ │ History    │ │ (Popularity Tree)    │ │
│  └────────────┘  └────────────┘  └──────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐   │
│  │ Graph Model  │  │ MDD          │  │ Storage        │   │
│  │ (semantic)   │  │ Serializer   │  │ (IndexedDB /   │   │
│  │              │  │ (split I/O)  │  │  File API)     │   │
│  └──────────────┘  └──────────────┘  └────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Rendering Pipeline

```
Every frame (requestAnimationFrame @ 60fps):

1. INPUT PHASE
   ├── Process mouse/touch/keyboard events (batched)
   └── Update camera transform (pan/zoom with inertia)

2. UPDATE PHASE
   ├── Dirty check: did anything change? If not → SKIP (0% CPU)
   ├── Frustum culling: query quadtree for visible nodes
   ├── Level of Detail: simplify distant/small nodes
   ├── Recalculate group bounding boxes (if member nodes moved)
   └── Recalculate port positions for Normal Nodes

3. RENDER PHASE (draw order back-to-front)
   ├── Clear framebuffer
   ├── Draw infinite grid (instanced, 1 draw call)
   ├── Draw group backgrounds (batched semi-transparent rects)
   ├── Draw edges (batched geometry buffer, 1-2 draw calls)
   │   ├── Normal→Normal: port-to-port bezier curves
   │   ├── Loop→Any: center-point edges with fan-out
   │   └── Any→Loop: edges route to center
   ├── Draw nodes (batched via instancing)
   │   ├── Normal Nodes: unified body (title + content) + two-column port rows
   │   └── Loop Nodes: simple titled box
   ├── Draw port circles on Normal Nodes
   ├── Draw text (SDF atlas, 1 draw call for ALL text)
   ├── Draw selection/hover overlays
   └── Draw minimap

4. IDLE PHASE
   └── Nothing changed → no render → 0% CPU
```

### 7.3 Core Data Model (Runtime)

```typescript
// ============================================
// RUNTIME DATA MODEL (in-memory while editing)
// ============================================

// --- Core Types ---
type NodeId = string;   // hex string, e.g. "57402da901af3a62"
type EdgeId = string;
type PortId = string;
type ColorCode = "0" | "1" | "2" | "3" | "4" | "5" | "6";

interface Vec2 {
  x: number;
  y: number;
}

// --- Graph (runtime, merges both MDD files) ---
interface GraphRuntime {
  nodes: Map<NodeId, RuntimeNode>;
  edges: Map<EdgeId, RuntimeEdge>;
  colorLegend: Record<ColorCode, string>;
  viewport: Viewport;
}

// --- Node base ---
interface RuntimeNodeBase {
  id: NodeId;
  text: string;          // title / display name
  color: ColorCode;
  group?: string;        // metadata group tag
  position: Vec2;        // from positions file
  size: Vec2;            // from positions file
}

// --- Normal Node ---
// No title bar: title is the first line of the body, content follows below
// Ports are two independent columns: inputs (left) and outputs (right)
interface NormalNode extends RuntimeNodeBase {
  type: "normal";
  content?: string;        // text content or file path
  contentType: "text" | "file";
  inputPorts: Port[];      // dynamic, auto-grow (left column)
  outputPorts: Port[];     // dynamic, auto-grow (right column, independent)
}

// --- Loop Node ---
interface LoopNode extends RuntimeNodeBase {
  type: "loop";
  // No ports, no content. Just title + center connection point.
}

type RuntimeNode = NormalNode | LoopNode;

// --- Port (only on Normal Nodes) ---
interface Port {
  id: PortId;
  connectedEdgeId?: EdgeId;    // null if empty/available
  connectedNodeId?: NodeId;    // the OTHER node's ID
  connectedNodeText?: string;  // cached: the OTHER node's title (displayed near port)
}

// --- Edge ---
interface RuntimeEdge {
  id: EdgeId;
  source: NodeId;
  target: NodeId;
  sourcePortId?: PortId;  // only if source is NormalNode
  targetPortId?: PortId;  // only if target is NormalNode
  color: ColorCode;       // same legend as nodes; autolayout uses 0 vs 1+
  label?: string;
  waypoints: Vec2[];      // user-defined bend points
}

// --- Viewport ---
interface Viewport {
  center: Vec2;
  zoom: number;  // 0.1 to 10.0
}
```

### 7.4 Port Manager — Auto-Growth Logic

```typescript
class PortManager {

  /**
   * Called when a new edge connects to a Normal Node's input.
   * 1. Fill the first empty input port with the source node's info
   * 2. Auto-add a new empty input port at the end
   */
  connectInput(node: NormalNode, edge: RuntimeEdge, sourceNode: RuntimeNode): void {
    // Find first empty input port
    const emptyPort = node.inputPorts.find(p => !p.connectedEdgeId);

    if (emptyPort) {
      emptyPort.connectedEdgeId = edge.id;
      emptyPort.connectedNodeId = sourceNode.id;
      emptyPort.connectedNodeText = sourceNode.text;  // ← "game" displayed near port
    }

    // Always ensure there's one empty port at the end
    const hasEmpty = node.inputPorts.some(p => !p.connectedEdgeId);
    if (!hasEmpty) {
      node.inputPorts.push({ id: generateId(), connectedEdgeId: undefined,
                             connectedNodeId: undefined, connectedNodeText: undefined });
    }
  }

  /**
   * Called when an edge is removed from a Normal Node's input.
   * 1. Clear the port
   * 2. Clean up excess empty ports (keep exactly 1 empty at end)
   */
  disconnectInput(node: NormalNode, edgeId: EdgeId): void {
    const port = node.inputPorts.find(p => p.connectedEdgeId === edgeId);
    if (port) {
      port.connectedEdgeId = undefined;
      port.connectedNodeId = undefined;
      port.connectedNodeText = undefined;
    }
    this.cleanupEmptyPorts(node.inputPorts);
  }

  /** Remove trailing empty ports, keep exactly one empty at end */
  private cleanupEmptyPorts(ports: Port[]): void {
    // Keep removing last port if empty AND the one before it is also empty
    while (ports.length > 1 &&
           !ports[ports.length - 1].connectedEdgeId &&
           !ports[ports.length - 2].connectedEdgeId) {
      ports.pop();
    }
  }

  // connectOutput() and disconnectOutput() mirror the input methods above,
  // operating on node.outputPorts instead of node.inputPorts. Same logic.
}
```

### 7.5 Connection Rules

| Source | Target | Edge anchors to |
|---|---|---|
| Normal → Normal | source output port → target input port | Port positions on both sides |
| Normal → Loop | source output port → target center | Port on source, center of loop |
| Loop → Normal | source center → target input port | Center of loop, port on target |
| Loop → Loop | source center → target center | Center to center |

### 7.6 Group Rendering Algorithm

```typescript
function renderGroups(ctx: WebGL2RenderingContext, nodes: RuntimeNode[]): void {
  // 1. Collect groups
  const groups = new Map<string, RuntimeNode[]>();
  for (const node of nodes) {
    if (node.group) {
      if (!groups.has(node.group)) groups.set(node.group, []);
      groups.get(node.group)!.push(node);
    }
  }

  // 2. For each group, compute bounding box and draw
  for (const [groupName, members] of groups) {
    const padding = 40; // px
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const node of members) {
      minX = Math.min(minX, node.position.x - padding);
      minY = Math.min(minY, node.position.y - padding);
      maxX = Math.max(maxX, node.position.x + node.size.x + padding);
      maxY = Math.max(maxY, node.position.y + node.size.y + padding);
    }

    // Draw semi-transparent rounded rect
    drawRoundedRect(ctx, minX, minY, maxX - minX, maxY - minY, {
      fillColor: groupColorWithAlpha(members[0].color, 0.08),
      borderColor: groupColorWithAlpha(members[0].color, 0.3),
      borderRadius: 12,
    });

    // Draw group label
    drawText(ctx, groupName, minX + 8, minY - 20, { fontSize: 12, color: "#888" });
  }
}
```

---

## 8. Performance Techniques

### 8.1 Frustum Culling via Quadtree
```
Only render what's inside the viewport.
10,000 nodes but 50 visible → only 50 nodes processed.
Quadtree query: O(log n) per frame.
```

### 8.2 Level of Detail (LOD)
```
Zoom > 0.8:    Full detail (text, ports, content, borders, shadows)
Zoom 0.4–0.8:  Simplified (title, colored box, no port labels)
Zoom 0.1–0.4:  Minimal (colored rectangles, no text)
Zoom < 0.1:    Dots (colored pixels, group outlines only)

(Zoom range: 0.1 to 10.0. Default view = 1.0)
```

### 8.3 Batch Rendering
```
BAD:  for each node → drawRect() → 10,000 draw calls → slow
GOOD: collect all rects → single vertex buffer → 1 draw call → fast
WebGL instanced rendering → 100,000 rectangles in 1 call.
```

### 8.4 SDF Text Atlas
```
Signed Distance Field fonts:
- Pre-render glyphs into texture atlas
- Render text as textured quads (GPU scales them)
- Crisp at any zoom level
- ALL text in the entire canvas = 1 draw call
```

### 8.5 Idle Detection — Zero CPU When Not Interacting
```typescript
let dirty = false;
function markDirty() { dirty = true; }

function frameLoop() {
  requestAnimationFrame(frameLoop);
  if (!dirty && !animating) return;  // ← 0% CPU when idle
  render();
  dirty = false;
}
```

### 8.6 Web Worker for Autolayout
```
Main Thread:    Input → Render → 60fps
Worker Thread:  Popularity-based tree autolayout (see Section 6.6)
Communication:  SharedArrayBuffer = zero-copy
Trigger:        LLM graph edit, topology MDD import, or manual request
```

---

## 9. Project Structure

```
arkcanvas/
├── src/
│   ├── engine/
│   │   ├── Engine.ts              # Main orchestrator
│   │   ├── Camera.ts              # Pan/zoom/transform with inertia
│   │   ├── InputManager.ts        # Mouse/touch/keyboard unified
│   │   └── FrameLoop.ts           # rAF with dirty-flag idle detection
│   │
│   ├── graph/
│   │   ├── Graph.ts               # Runtime graph model
│   │   ├── NormalNode.ts          # Normal node logic
│   │   ├── LoopNode.ts            # Loop node logic
│   │   ├── Edge.ts                # Edge routing & types
│   │   ├── PortManager.ts         # Auto-grow port logic
│   │   └── GroupResolver.ts       # Compute group bounding boxes from metadata
│   │
│   ├── renderer/
│   │   ├── WebGLRenderer.ts       # Core WebGL2 setup, draw loop
│   │   ├── NormalNodeRenderer.ts  # Batched normal node drawing
│   │   ├── LoopNodeRenderer.ts    # Batched loop node drawing
│   │   ├── PortRenderer.ts        # Port circles on normal nodes
│   │   ├── EdgeRenderer.ts        # Bezier/straight/center edge batching
│   │   ├── GroupRenderer.ts       # Semi-transparent group backgrounds
│   │   ├── TextRenderer.ts        # SDF text atlas
│   │   ├── GridRenderer.ts        # Infinite grid (instanced)
│   │   └── MinimapRenderer.ts     # Scaled overview
│   │
│   ├── spatial/
│   │   └── QuadTree.ts            # Spatial index (JS fallback)
│   │
│   ├── commands/
│   │   ├── CommandManager.ts      # Undo/redo stack
│   │   ├── AddNodeCommand.ts
│   │   ├── DeleteNodeCommand.ts
│   │   ├── ConnectEdgeCommand.ts
│   │   ├── DisconnectEdgeCommand.ts
│   │   ├── MoveNodeCommand.ts
│   │   └── ChangeGroupCommand.ts
│   │
│   ├── serialization/
│   │   ├── MDDSerializer.ts       # Read/write graph.mdd.json
│   │   ├── PositionsSerializer.ts # Read/write positions.mdd.json
│   │   ├── ObsidianImporter.ts    # Import from .canvas format
│   │
│   ├── ui/                        # Thin HTML shell (NOT for canvas)
│   │   ├── Toolbar.ts
│   │   ├── PropertyPanel.ts
│   │   ├── ContextMenu.ts
│   │   ├── SearchDialog.ts
│   │   └── ColorLegendPanel.ts
│   │
│   ├── workers/
│   │   └── LayoutWorker.ts        # Web Worker for autolayout (popularity tree)
│   │
│   ├── wasm/                      # Rust → WASM modules
│   │   ├── src/
│   │   │   ├── spatial.rs         # Quadtree, R-tree
│   │   │   ├── layout.rs          # Popularity-based tree autolayout
│   │   │   └── lib.rs
│   │   └── Cargo.toml
│   │
│   ├── App.ts                     # Root app initialization
│   └── main.ts                    # Entry point
│
├── public/
│   └── fonts/                     # SDF font atlas textures
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 10. Deployment

ArkCanvas is a local-use tool. Deployment = build static files and open them on your machine.

### Build

```
npm install
npm run build       # Vite outputs dist/ with all static assets (HTML + JS + WASM)
```

### Run

Open `dist/index.html` directly in a browser, or serve with any static server:

```
npx serve dist
```

The PWA Service Worker caches all assets on first load — after that, ArkCanvas works fully offline.

### HTTP Headers

When serving over HTTP (not `file://`), the Web Worker + SharedArrayBuffer requires:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Vite dev server (`npm run dev`) sets these automatically. For production serving, configure your static server accordingly.

### Update

Replace `dist/` with a new build. The Service Worker detects changes on next load and updates automatically.

---

## 11. Performance Budget

| Metric | Target | How |
|---|---|---|
| First Paint | < 500ms | Tiny bundle, lazy WASM |
| Time to Interactive | < 1s | Code-split non-critical features |
| Idle CPU | 0% | Dirty-flag frame loop |
| Active CPU (panning) | < 15% | WebGL batching, frustum culling |
| Memory (empty) | < 25MB | Minimal allocations |
| Memory (10K nodes) | < 70MB | Typed arrays, object pooling |
| Frame time | < 16ms (60fps) | All techniques combined |
| Bundle size | < 200KB gzip | Tree-shaking, lazy load WASM |

---

## 12. Development Roadmap

### Phase 1 — Core Canvas Engine (Weeks 1-4)
- [ ] WebGL2 renderer with infinite grid
- [ ] Camera system (pan/zoom with inertia)
- [ ] Input handling (mouse, touch, keyboard)
- [ ] Dirty-flag frame loop with idle detection
- [ ] Quadtree spatial index
- [ ] Basic Normal Node rendering (title + colored box)

### Phase 2 — Node Types & Connections (Weeks 5-8)
- [ ] Normal Node: full rendering (title, content, ports)
- [ ] Loop Node: center-connected rendering
- [ ] Port Manager: auto-grow logic, connected node name display
- [ ] Edge rendering: bezier (Normal↔Normal), center (Loop↔any)
- [ ] Connection rules enforcement (port-to-port vs center)
- [ ] Color legend system

### Phase 3 — Groups & Editing (Weeks 9-12)
- [ ] Metadata-based group rendering (bounding box from tags)
- [ ] Command system (undo/redo)
- [ ] Selection (single, multi, box-select)
- [ ] Copy/paste, delete
- [ ] MDD serialization (split graph + positions)
- [ ] Obsidian Canvas import

### Phase 4 — Polish & Performance (Weeks 13-16)
- [ ] Minimap
- [ ] Full-text search across nodes
- [ ] Keyboard shortcuts
- [ ] Level of Detail (LOD) system
- [ ] SDF text rendering
- [ ] Theming (light/dark)

### Phase 5 — WASM & Advanced (Weeks 17-20)
- [ ] Port quadtree to Rust/WASM
- [ ] Popularity-based tree autolayout (Section 6.6)
- [ ] Web Worker autolayout computation
- [ ] Topology MDD import (codebase → graph)
- [ ] Export to PNG/SVG
- [ ] Stress test: 50K+ nodes benchmark (10K+ topology graphs)
- [ ] LLM integration helpers (context export, graph modification)

---

## 13. Key Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Platform | Pure Web App (WebGL2) | Zero install, cross-platform, proven by Figma/tldraw |
| Renderer | Custom WebGL2 | Maximum control, no framework overhead, idle = 0% CPU |
| Language | TypeScript + Rust(WASM) | TS for dev speed, Rust for hot paths |
| Node types | Normal + Loop only | Two clear paradigms cover all graph use cases |
| Normal Node design | No title bar, two-column ports | Compact body, inputs and outputs grow independently |
| Groups | Metadata on nodes | No ghost group nodes, LLM-clean graph, dynamic rendering |
| Serialization | Split JSON (graph + positions) | LLM reads semantic model only, visual data separate |
| Autolayout | Popularity-based tree | LLM never provides coordinates; topology of 10K+ nodes auto-positioned |
| Port behavior | Two-column, auto-grow, show connected name | Intuitive UX, independent growth, self-documenting connections |
| State | Zustand (~1KB) | Minimal, no boilerplate |
| Spatial Index | Quadtree (WASM) | O(log n) queries, critical for perf |
| Text | SDF Font Atlas | Crisp at any zoom, 1 draw call |
| Build | Vite | Fastest DX, native WASM support |

---

## 14. Summary

**ArkCanvas** is an MDD-first graph editor where the graph is a semantic model designed to be read by both humans and LLM agents. The split format (`graph.mdd.json` + `positions.mdd.json`) ensures clean separation between meaning and presentation.

Two node types — **Normal** (structured ports that auto-grow, show connected names) and **Loop** (minimal center-connected hubs) — provide clear, distinct paradigms for different graph concepts.

Groups are **metadata, not nodes** — a simple tag on each node that the renderer uses to draw boundaries dynamically.

The pure web app approach with WebGL2 delivers:
- **60fps** with 10,000+ nodes
- **0% CPU** when idle
- **< 200KB** bundle
- **Zero install** — just open a URL
- **Proven architecture** validated by Figma, tldraw, Excalidraw

---

*Document authored: February 27, 2026*  
*Last updated: March 3, 2026*  
*Next step: Prototype WebGL2 renderer + Camera + Normal Node rendering (Phase 1)*
