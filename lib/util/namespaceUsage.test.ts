import { describe, it } from 'node:test';
import { namespaceUsage } from './namespaceUsage.js';
import ts from 'typescript';
import assert from 'node:assert/strict';

describe('namespaceUsage', () => {
  it('should return namespace usage for a simple file', () => {
    const sourceFile = ts.createSourceFile(
      '/app/a.ts',
      `import * as b from './b';
b.x;`,
      ts.ScriptTarget.ESNext,
    );

    const result = namespaceUsage({ sourceFile });

    assert.deepEqual(result.get('b'), ['x']);
  });
});
