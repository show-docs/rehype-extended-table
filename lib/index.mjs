import { strict as assert } from 'node:assert';

import { visit } from 'unist-util-visit';

const enums = ['left', 'right'];

function validate({ mergeTo }) {
  try {
    assert(
      typeof mergeTo === 'string',
      new TypeError('`mergeTo` should be string'),
    );

    assert(
      enums.includes(mergeTo),
      new TypeError('`options.mergeTo` should be `left` or `right`'),
    );
  } catch (error) {
    throw error.actual || error;
  }
}

const needClean = ['table', 'thead', 'tfoot', 'tbody', 'tr'];

function isTargetCell(item, pattern) {
  return (
    item.type === 'element' &&
    (item.tagName === 'th' || item.tagName === 'td') &&
    item.children.length === 1 &&
    item.children[0].type === 'text' &&
    item.children[0].value.trim() === pattern
  );
}

/* eslint-disable no-param-reassign */

export function rehypeExtendedTable({ mergeTo = 'right' } = {}) {
  validate({ mergeTo });

  const edge = mergeTo === 'right' ? 1 : -1;

  const mark = mergeTo === 'right' ? '>' : '<';

  return (tree) => {
    visit(
      tree,
      (item) =>
        item?.type === 'element' &&
        needClean.includes(item.tagName) &&
        item.children?.length,
      (item) => {
        item.children = item.children.filter(
          ({ type, value }) => !(type === 'text' && value === '\n'),
        );
      },
    );

    visit(
      tree,
      (cell, cellIndex, parent) =>
        parent?.children[cellIndex + edge] && isTargetCell(cell, mark),
      (cell, cellIndex, parent) => {
        cell.delete = true;
        cell.children = [];

        const key = cellIndex + edge;

        parent.children[key].properties ??= {};
        parent.children[key].properties.colSpan ??= 1;
        parent.children[key].properties.colSpan +=
          cell.properties?.colSpan ?? 1;
      },
      mergeTo === 'left',
    );

    visit(
      tree,
      (item) => item.type === 'element' && item.tagName === 'tr',
      (row, rowIndex, parent) => {
        visit(
          row,
          (cell) => parent.children?.[rowIndex - 1] && isTargetCell(cell, '^'),
          (cell, cellIndex) => {
            cell.delete = true;
            cell.children = [];

            const key = rowIndex - 1;

            parent.children[key].children[cellIndex].properties ??= {};
            parent.children[key].children[cellIndex].properties.rowSpan ??= 1;
            parent.children[key].children[cellIndex].properties.rowSpan +=
              cell.properties?.rowSpan ?? 1;
          },
        );
      },
      true,
    );

    visit(
      tree,
      (item) => item.type === 'element' && item.tagName === 'tr',
      (tr) => {
        tr.children = tr.children.filter((td) => !td.delete);
      },
    );
  };
}
