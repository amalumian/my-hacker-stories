import * as React from 'react';

import classes from './SearchForm.module.scss';

import { InputWithLabel } from '../InputWithLabel/InputWithLabel';

const SearchForm = ({ searchTerm, onSearchInput, onSearchSubmit }) => {
  return (
    <form onSubmit={onSearchSubmit} className={classes['search-form']}>
      <InputWithLabel id="search" value={searchTerm} isFocused onInputChange={onSearchInput}>
        <strong>Search:</strong>
      </InputWithLabel>

      <button
        type="submit"
        disabled={!searchTerm}
        className={`${classes.button} ${classes['button_large']} `}
      >
        Submit
      </button>
    </form>
  );
};

export { SearchForm };
