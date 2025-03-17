import { Graph } from "./Graph.js";
class DependencyGraph extends Graph {
  constructor() {
    super(() => ({
      depth: 0
    }));
  }
  eject() {
    const map = /* @__PURE__ */ new Map();
    for (const [k, v] of this.vertexes.entries()) {
      map.set(k, {
        from: new Set(v.from),
        to: new Set(v.to),
        data: {
          depth: v.data.depth
        }
      });
    }
    return map;
  }
}
export {
  DependencyGraph
};
