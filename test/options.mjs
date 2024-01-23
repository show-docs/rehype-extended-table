import test from 'ava';

import { rehypeExtendedTable } from '../lib/index.mjs';

function marco(t, ...configs) {
  for (const config of configs) {
    const error = t.throws(() => rehypeExtendedTable(config), {
      instanceOf: TypeError,
    });

    t.snapshot(error);
  }
}

test(
  'mergeTo',
  marco,
  { mergeTo: '' },
  { mergeTo: '55' },
  { mergeTo: 1 },
  { mergeTo: null },
  { mergeTo: [] },
);
