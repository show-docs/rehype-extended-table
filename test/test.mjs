import { readFile } from 'node:fs/promises';

import test from 'ava';
import cliHtml from 'cli-html';
import prettier from 'prettier';
import rehypeSortAttributes from 'rehype-sort-attributes';
import rehypeStringify from 'rehype-stringify';
import {
  extendedTableHandlers,
  remarkExtendedTable,
} from 'remark-extended-table';
import remarkGFM from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

import { rehypeExtendedTable } from '../lib/index.mjs';

const input1 = await readFile(
  new URL('fixtures/1.md', import.meta.url),
  'utf8',
);
const input2 = await readFile(
  new URL('fixtures/2.md', import.meta.url),
  'utf8',
);

const gfm = () => unified().use(remarkParse).use(remarkGFM);

function format(code) {
  return prettier.format(code, { parser: 'html' });
}

async function macro(t, input) {
  const expected = await gfm()
    .use(remarkExtendedTable)
    .use(remarkRehype, null, {
      handlers: { ...extendedTableHandlers },
    })
    .use(rehypeSortAttributes)
    .use(rehypeStringify)
    .process(input);

  const result = await gfm()
    .use(remarkRehype)
    .use(rehypeExtendedTable)
    .use(rehypeSortAttributes)
    .use(rehypeStringify)
    .process(input);

  t.is(format(result.value), format(expected.value));

  t.snapshot(format(result.value));

  t.log(cliHtml(result.value));
}

test('input-1', macro, input1);
test('input-2', macro, input2);
