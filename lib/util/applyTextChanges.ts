import ts from 'typescript';

const limitTrailingLineBreak = (value: string, count: number) =>
  value.replace(new RegExp(`\n{${count},}$`), '\n'.repeat(count));

const pushClean = (list: string[], value: string) => {
  const leadingLineBreakCount = value.match(/^\n+/)?.[0].length || 0;

  if (leadingLineBreakCount === 0) {
    list.push(value);
    return;
  }

  const last = list.pop() || '';

  list.push(
    limitTrailingLineBreak(
      `${last}${value.slice(0, leadingLineBreakCount)}`,
      2,
    ),
  );

  const sliced = value.slice(leadingLineBreakCount);

  if (sliced) {
    list.push(sliced);
  }
};

export const applyTextChanges = (
  oldContent: string,
  changes: readonly ts.TextChange[],
) => {
  const result: string[] = [];

  const sortedChanges = [...changes].sort(
    (a, b) => a.span.start - b.span.start,
  );

  let currentPos = 0;

  for (const change of sortedChanges) {
    pushClean(result, oldContent.slice(currentPos, change.span.start));

    if (change.newText) {
      pushClean(result, change.newText);
    }

    currentPos = change.span.start + change.span.length;
  }

  const remaining = oldContent.slice(currentPos);

  if (remaining) {
    pushClean(result, remaining);
  }

  const firstItem = result.shift();

  if (typeof firstItem !== 'undefined') {
    result.unshift(firstItem.replace(/^\n+/, ''));
  }

  const lastItem = result.pop();

  if (typeof lastItem !== 'undefined') {
    result.push(limitTrailingLineBreak(lastItem, 1));
  }

  return result.join('');
};
