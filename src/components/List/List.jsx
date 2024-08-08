import * as React from 'react';
import { sortBy } from 'lodash';

import classes from './List.module.scss';

import Check from '../../assets/check.svg?react';

const SORTS = {
  NONE: (list) => list,
  TITLE: (list) => sortBy(list, 'title'),
  AUTHOR: (list) => sortBy(list, 'author'),
  COMMENT: (list) => sortBy(list, 'num_comments').reverse(),
  POINT: (list) => sortBy(list, 'points').reverse()
};

const List = React.memo(({ list, onRemoveItem }) => {
  const [sort, setSort] = React.useState({
    sortKey: 'NONE',
    isReverse: false
  });

  const handleSort = (sortKey) => {
    const isReverse = sort.sortKey === sortKey && !sort.isReverse;
    setSort({ sortKey, isReverse });
  };

  const sortFunction = SORTS[sort.sortKey];
  const sortedList = sort.isReverse ? sortFunction(list).reverse() : sortFunction(list);

  return (
    <ul className={classes.list}>
      <li className={classes.item}>
        <span style={{ width: '40%' }}>
          <button
            className={`${classes.button_sort} ${sort.sortKey === 'TITLE' && classes.button_active} ${sort.sortKey === 'TITLE' && sort.isReverse && classes.button_active_dec}`}
            onClick={() => handleSort('TITLE')}
          >
            Title
          </button>
        </span>
        <span style={{ width: '30%' }}>
          <button
            className={`${classes.button_sort} ${sort.sortKey === 'AUTHOR' && classes.button_active} ${sort.sortKey === 'AUTHOR' && sort.isReverse && classes.button_active_dec}`}
            onClick={() => handleSort('AUTHOR')}
          >
            Author
          </button>
        </span>
        <span style={{ width: '10%' }}>
          <button
            className={`${classes.button_sort} ${sort.sortKey === 'COMMENT' && classes.button_active} ${sort.sortKey === 'COMMENT' && sort.isReverse && classes.button_active_dec}`}
            onClick={() => handleSort('COMMENT')}
          >
            Comments
          </button>
        </span>
        <span style={{ width: '10%' }}>
          <button
            className={`${classes.button_sort} ${sort.sortKey === 'POINT' && classes.button_active} ${sort.sortKey === 'POINT' && sort.isReverse && classes.button_active_dec}`}
            onClick={() => handleSort('POINT')}
          >
            Points
          </button>
        </span>
        <span className={classes.sort} style={{ width: '10%' }}>
          Action
        </span>
      </li>

      {sortedList.map((item) => (
        <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
      ))}
    </ul>
  );
});
List.displayName = 'List';

const Item = ({ item, onRemoveItem }) => (
  <li className={classes.item}>
    <span style={{ width: '40%' }}>
      <a href={item.url}>{item.title}</a>
    </span>
    <span style={{ width: '30%' }}>{item.author}</span>
    <span style={{ width: '10%' }}>{item.num_comments}</span>
    <span style={{ width: '10%' }}>{item.points}</span>
    <span style={{ width: '10%' }}>
      <button
        className={`${classes.button} ${classes['button_small ']} `}
        type="button"
        onClick={() => onRemoveItem(item)}
      >
        <Check data-testid="svg" height="18px" width="18px" />
      </button>
    </span>
  </li>
);

export { List, Item };
