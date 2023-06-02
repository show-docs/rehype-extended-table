import { visit } from 'unist-util-visit';

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

export function rehypeExtendedTable() {
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
        parent?.children?.[cellIndex + 1] && isTargetCell(cell, '>'),
      (cell, cellIndex, parent) => {
        cell.delete = true;
        cell.children = [];
        parent.children[cellIndex + 1].properties ??= {};
        parent.children[cellIndex + 1].properties.colSpan ??= 1;
        parent.children[cellIndex + 1].properties.colSpan +=
          cell.properties?.colSpan ?? 1;
      },
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
            parent.children[rowIndex - 1].children[cellIndex].properties ??= {};
            parent.children[rowIndex - 1].children[
              cellIndex
            ].properties.rowSpan ??= 1;
            parent.children[rowIndex - 1].children[
              cellIndex
            ].properties.rowSpan += cell.properties?.rowSpan ?? 1;
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
