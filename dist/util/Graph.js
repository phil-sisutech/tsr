class Graph {
  vertexes = /* @__PURE__ */ new Map();
  #setupVertex;
  constructor(...args) {
    this.#setupVertex = args[0] || (() => void 0);
  }
  addVertex(vertex) {
    const selected = this.vertexes.get(vertex);
    if (selected) {
      return selected;
    }
    const created = {
      to: /* @__PURE__ */ new Set(),
      from: /* @__PURE__ */ new Set(),
      data: this.#setupVertex()
    };
    this.vertexes.set(vertex, created);
    return created;
  }
  deleteVertex(vertex) {
    const selected = this.vertexes.get(vertex);
    if (!selected) {
      return;
    }
    for (const v of selected.to) {
      const target = this.vertexes.get(v);
      if (!target) {
        continue;
      }
      target.from.delete(vertex);
      if (target.from.size === 0 && target.to.size === 0) {
        this.vertexes.delete(v);
      }
    }
    for (const v of selected.from) {
      const target = this.vertexes.get(v);
      if (!target) {
        continue;
      }
      target.to.delete(vertex);
      if (target.from.size === 0 && target.to.size === 0) {
        this.vertexes.delete(v);
      }
    }
    this.vertexes.delete(vertex);
  }
  addEdge(source, destination) {
    const s = this.addVertex(source);
    const d = this.addVertex(destination);
    s.to.add(destination);
    d.from.add(source);
  }
}
export {
  Graph
};
