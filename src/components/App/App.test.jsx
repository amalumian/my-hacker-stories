import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';

import App, { storiesReducer } from './App';

vi.mock('axios');

const storyOne = {
  title: 'React',
  url: 'https://reactjs.org/',
  author: 'Jordan Walke',
  num_comments: 3,
  points: 4,
  objectID: 0
};

const storyTwo = {
  title: 'Redux',
  url: 'https://redux.js.org/',
  author: 'Dan Abramov, Andrew Clark',
  num_comments: 2,
  points: 5,
  objectID: 1
};

const stories = [storyOne, storyTwo];

describe('storiesReducer', () => {
  it('removes a story from all stories', () => {
    const action = { type: 'REMOVE_STORY', payload: storyOne };
    const state = { data: stories, isLoading: false, isError: false };

    const newState = storiesReducer(state, action);

    const expectedState = {
      data: [storyTwo],
      isLoading: false,
      isError: false
    };

    expect(newState).toStrictEqual(expectedState);
  });
});

describe('App', () => {
  it('succeeds fetching data', async () => {
    const promise = Promise.resolve({
      data: {
        hits: stories
      }
    });

    axios.mockImplementationOnce(() => promise);

    render(<App />);

    expect(screen.queryByText(/Loading/)).toBeInTheDocument();

    await waitFor(async () => await promise);

    expect(screen.queryByText(/Loading/)).toBeNull();

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Redux')).toBeInTheDocument();
    expect(screen.getAllByTestId('svg').length).toBe(2);
  });

  it('fails fetching data', async () => {
    const promise = Promise.reject();

    axios.get.mockImplementationOnce(() => promise);

    render(<App />);

    expect(screen.getByText(/Loading/)).toBeInTheDocument();

    try {
      await waitFor(async () => await promise);
    } catch (error) {
      expect(screen.queryByText(/Loading/)).toBeNull();
      expect(screen.queryByText(/went wrong/)).toBeInTheDocument();
    }
  });

  it('removes a story', async () => {
    const promise = Promise.resolve({
      data: {
        hits: stories
      }
    });

    axios.mockImplementationOnce(() => promise);

    render(<App />);

    await waitFor(async () => await promise);

    expect(screen.getAllByTestId('svg').length).toBe(2);
    expect(screen.getByText('Jordan Walke')).toBeInTheDocument();

    fireEvent.click(screen.getAllByTestId('svg')[0]);

    expect(screen.getAllByTestId('svg').length).toBe(1);
    expect(screen.queryByText('Jordan Walke')).toBeNull();
  });

  it('searches for specific stories', async () => {
    const reactPromise = Promise.resolve({
      data: {
        hits: stories
      }
    });

    const anotherStory = {
      title: 'JavaScript',
      url: 'https://en.wikipedia.org/wiki/JavaScript',
      author: 'Brendan Eich',
      num_comments: 15,
      points: 10,
      objectID: 3
    };

    const javascriptPromise = Promise.resolve({
      data: {
        hits: [anotherStory]
      }
    });

    axios.mockImplementation((url) => {
      if (url.includes('React')) {
        return reactPromise;
      }

      if (url.includes('JavaScript')) {
        return javascriptPromise;
      }

      throw Error();
    });

    // Initial Render

    render(<App />);

    // First Data Fetching

    await waitFor(async () => await reactPromise);

    expect(screen.queryByDisplayValue('React')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('JavaScript')).toBeNull();

    expect(screen.queryByText('Jordan Walke')).toBeInTheDocument();
    expect(screen.queryByText('Dan Abramov, Andrew Clark')).toBeInTheDocument();
    expect(screen.queryByText('Brendan Eich')).toBeNull();

    // User Interaction -> Search

    fireEvent.change(screen.queryByDisplayValue('React'), {
      target: {
        value: 'JavaScript'
      }
    });

    expect(screen.queryByDisplayValue('React')).toBeNull();
    expect(screen.queryByDisplayValue('JavaScript')).toBeInTheDocument();

    fireEvent.submit(screen.queryByText('Submit'));
  });
});
