import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import app from './app';
import projects from './projects';
import markdown from './markdown';
import note from './note';
import drive from './drive';

const rootReducer = combineReducers({
  app,
  projects,
  markdown,
  note,
  drive,
  routing: routerReducer,
});

export default rootReducer;
