class MemoryFileService {
  #files;
  #fileNames = /* @__PURE__ */ new Set();
  constructor(initialFiles) {
    this.#files = /* @__PURE__ */ new Map();
    for (const [name, content] of initialFiles || []) {
      this.#files.set(name, {
        content,
        version: 0
      });
    }
    this.#fileNames = new Set(this.#files.keys());
  }
  set(name, content) {
    const stored = this.#files.get(name);
    if (stored) {
      this.#files.set(name, {
        content,
        version: stored.version + 1
      });
    } else {
      this.#files.set(name, {
        content,
        version: 0
      });
      this.#fileNames = new Set(this.#files.keys());
    }
  }
  get(name) {
    const file = this.#files.get(name);
    return file ? file.content : "";
  }
  delete(name) {
    this.#files.delete(name);
    this.#fileNames = new Set(this.#files.keys());
  }
  getVersion(name) {
    const file = this.#files.get(name);
    return file ? file.version.toString() : "";
  }
  // we reuse the same Set and update when there's a change in the file list
  // so that this Set reference can be used as a key for memoization
  // see also: lib/util/parseFile.ts
  getFileNames() {
    return this.#fileNames;
  }
  exists(name) {
    return this.#files.has(name);
  }
  eject() {
    const res = /* @__PURE__ */ new Map();
    for (const [name, { content }] of this.#files) {
      res.set(name, content);
    }
    return res;
  }
}
export {
  MemoryFileService
};
