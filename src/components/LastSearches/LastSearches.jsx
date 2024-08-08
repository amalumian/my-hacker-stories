import { uniqueId } from 'lodash';
import classes from './LastSearches.module.scss';

const LastSearches = ({ lastSearches, onLastSearch }) => {
  return (
    <div className={classes.lastSearches}>
      {lastSearches.map((searchTerm) => {
        return (
          <button
            className={`${classes.button_small} ${classes.button}`}
            type="button"
            onClick={() => onLastSearch(searchTerm)}
            key={uniqueId()}
          >
            {searchTerm}
          </button>
        );
      })}
    </div>
  );
};

export { LastSearches };
