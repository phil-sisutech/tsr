import { DependencyGraph } from "./DependencyGraph.js";
import { parseFile } from "./parseFile.js";
const createDependencyGraph = ({
  fileService,
  entrypoints,
  options
}) => {
  const graph = new DependencyGraph();
  const stack = [];
  const untouched = new Set(fileService.getFileNames());
  for (const entrypoint of entrypoints) {
    stack.push({ file: entrypoint, depth: 0 });
  }
  while (stack.length > 0) {
    const item = stack.pop();
    if (!item) {
      break;
    }
    const { file, depth } = item;
    if (!untouched.has(file)) {
      continue;
    }
    untouched.delete(file);
    const { imports } = parseFile({
      file,
      content: fileService.get(file),
      destFiles: fileService.getFileNames(),
      options
    });
    Object.keys(imports).forEach((dest) => {
      graph.addEdge(file, dest);
      stack.push({ file: dest, depth: depth + 1 });
    });
    const vertex = graph.vertexes.get(file);
    if (vertex) {
      vertex.data.depth = depth;
    }
  }
  for (const file of untouched.values()) {
    const { imports } = parseFile({
      file,
      content: fileService.get(file),
      destFiles: fileService.getFileNames(),
      options
    });
    Object.keys(imports).forEach((dest) => {
      graph.addEdge(file, dest);
    });
    const vertex = graph.vertexes.get(file);
    if (vertex) {
      vertex.data.depth = Infinity;
    }
  }
  return graph;
};
export {
  createDependencyGraph
};
