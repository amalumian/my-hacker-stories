import * as React from 'react';
import axios from 'axios';

import classes from './App.module.scss';

import { SearchForm } from '../SearchForm/SearchForm';
import { List } from '../List/List';
import { useStorageState } from '../../hooks/useStorageState';
import { LastSearches } from '../LastSearches/LastSearches';

const storiesReducer = (state, action) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data:
          action.payload.page === 0 ? action.payload.list : state.data.concat(action.payload.list),
        page: action.payload.page
      };
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter((story) => action.payload.objectID !== story.objectID)
      };
    default:
      throw new Error();
  }
};

const API_BASE = 'https://hn.algolia.com/api/v1';
const API_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';

const getSumComments = (stories) => {
  return stories.data.reduce((result, value) => result + value.num_comments, 0);
};

const extractSearchTerm = (url) =>
  url.substring(url.lastIndexOf('?') + 1, url.lastIndexOf('&')).replace(PARAM_SEARCH, '');

const getLastSearches = (urls) =>
  urls
    .reduce((result, url, index) => {
      const searchTerm = extractSearchTerm(url);

      if (index === 0) {
        return result.concat(searchTerm);
      }

      const previousSearchTerm = result[result.length - 1];

      if (searchTerm === previousSearchTerm) {
        return result;
      }
      return result.concat(searchTerm);
    }, [])
    .slice(-6, -1)
    .map(extractSearchTerm);

const getUrl = (searchTerm, page) =>
  `${API_BASE}${API_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`;

const App = () => {
  const [searchTerm, setSearchTerm] = useStorageState('search', 'React');

  const [urls, setUrls] = React.useState([getUrl(searchTerm, 0)]);

  const [stories, dispatchStories] = React.useReducer(storiesReducer, {
    data: [],
    page: 0,
    isLoading: false,
    isError: false
  });

  const handleFetchStories = React.useCallback(async () => {
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    try {
      const lastUrl = urls[urls.length - 1];
      const result = await axios(lastUrl);

      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: {
          list: result.data.hits,
          page: result.data.page
        }
      });
    } catch {
      dispatchStories({ type: 'STORIES_FETCH_FAILURE' });
    }
  }, [urls]);

  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  const handleRemoveStory = React.useCallback((item) => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item
    });
  }, []);

  const handleSearchInput = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = (searchTerm, page) => {
    const url = getUrl(searchTerm, page);
    setUrls(urls.concat(url));
  };

  const handleSearchSubmit = (event) => {
    handleSearch(searchTerm, 0);

    event.preventDefault();
  };

  const handleLastSearch = (searchTerm) => {
    setSearchTerm(searchTerm);
    handleSearch(searchTerm, 0);
  };

  const handleMore = () => {
    const lastUrl = urls[urls.length - 1];
    const searchTerm = extractSearchTerm(lastUrl);
    handleSearch(searchTerm, stories.page + 1);
  };

  const lastSearches = getLastSearches(urls);

  const sumComments = React.useMemo(() => getSumComments(stories), [stories]);

  return (
    <div className={classes.container}>
      <h1 className={classes['headline-primary']}>My Hacker Stories with {sumComments} comments</h1>

      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      <LastSearches lastSearches={lastSearches} onLastSearch={handleLastSearch} />

      {stories.isError && <p>Something went wrong ...</p>}

      <List list={stories.data} onRemoveItem={handleRemoveStory} />

      {stories.isLoading ? (
        <p className={classes.loading}>Loading ...</p>
      ) : (
        <button className={classes.more} type="button" onClick={handleMore}>
          More
        </button>
      )}
    </div>
  );
};

export default App;

export { storiesReducer };
