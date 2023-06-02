# rehype-extended-table

Rehype plugin to support table syntax allowing colspan / rowspan.

[![npm][npm-badge]][npm-url]
[![github][github-badge]][github-url]
![node][node-badge]

[npm-url]: https://www.npmjs.com/package/rehype-extended-table
[npm-badge]: https://img.shields.io/npm/v/rehype-extended-table.svg?style=flat-square&logo=npm
[github-url]: https://github.com/nice-move/rehype-extended-table
[github-badge]: https://img.shields.io/npm/l/rehype-extended-table.svg?style=flat-square&colorB=blue&logo=github
[node-badge]: https://img.shields.io/node/v/rehype-extended-table.svg?style=flat-square&colorB=green&logo=node.js

## Feature

- support [extended table syntax][] of [markdown-preview-enhanced][] which allows colspan / rowspan cells
- same base syntax support with [remark-extended-table]

```markdown
| Head 1       | Head 2       | Head 3       | Head 4       |
| ------------ | ------------ | ------------ | ------------ |
| >            | Merged (2x1) | Cell         | Cell         |
| Merged (1x3) | >            | Merged (2x2) | Cell         |
| ^            | >            | ^            | Cell         |
| ^            | >            | >            | Merged (3x1) |
```

↓↓

```html
<table>
  <thead>
    <tr>
      <th>Head 1</th>
      <th>Head 2</th>
      <th>Head 3</th>
      <th>Head 4</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td colspan="2">Merged (2x1)</td>
      <td>Cell</td>
      <td>Cell</td>
    </tr>
    <tr>
      <td rowspan="3">Merged (1x3)</td>
      <td colspan="2" rowspan="2">Merged (2x2)</td>
      <td>Cell</td>
    </tr>
    <tr>
      <td>Cell</td>
    </tr>
    <tr>
      <td colspan="3">Merged (3x1)</td>
    </tr>
  </tbody>
</table>
```

[remark-gfm]: https://github.com/remarkjs/remark-gfm
[remark-extended-table]: https://www.npmjs.com/package/remark-extended-table
[extended table syntax]: https://shd101wyy.github.io/markdown-preview-enhanced/#/markdown-basics?id=table
[markdown-preview-enhanced]: https://github.com/shd101wyy/markdown-preview-enhanced

## Installation

```bash
npm install rehype-extended-table --save-dev
```

## Usage

```js
import { rehypeExtendedTable } from 'rehype-extended-table';
import rehypeStringify from 'rehype-stringify';
import remarkGFM from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

unified()
  .use(remarkParse)
  .use(remarkGFM)
  .use(remarkRehype)
  .use(rehypeExtendedTable)
  .use(rehypeStringify)
  .process(markdown);
```

## Tips

### Why do I need this plugin?

[remark-extended-table](https://www.npmjs.com/package/remark-extended-table) is good, but it wiil overrides [remark-gfm] behaviors, and have to inject handlers to [remark-rehype](https://www.npmjs.com/package/remark-rehype):

```js
import rehypeStringify from 'rehype-stringify';
import {
  extendedTableHandlers,
  remarkExtendedTable
} from 'remark-extended-table';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkExtendedTable)
  .use(remarkRehype, null, {
    handlers: {
      ...extendedTableHandlers
    }
  })
  .use(rehypeStringify)
  .process(markdown);
```

Some times we can't do that, you can use this plugin instead.

For example, in [Docusaurus](https://docusaurus.io/) projects:

```cjs
// docusaurus.config.cjs
module.exports = async function createConfig() {
  const { rehypeExtendedTable } = await import('rehype-extended-table');

  return {
    presets: [
      [
        'classic',
        {
          docs: {
            rehypePlugins: [
              [
                rehypeExtendedTable,
                {
                  // ...options here
                }
              ]
            ]
          }
        }
      ]
    ]
  };
};
```

### Different with `rehype-table-merge`

- rehype-extended-table support MDX props name by default.
- rehype-extended-table can handle complex [merge case](./test/fixtures/1.md) without bug

## Related

- [markdown-code-block-meta](https://github.com/nice-move/markdown-code-block-meta)
- [remark-code-example](https://github.com/nice-move/remark-code-example)
- [remark-kroki](https://github.com/nice-move/remark-kroki)
- [remark-docusaurus](https://github.com/nice-move/remark-docusaurus)
