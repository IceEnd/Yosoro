import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import app from './app';
import projects from './projects';
import markdown from './markdown';
import note from './note';
import drive from './drive';
import exportQueue from './exportQueue';
import user from './user';

const rootReducer = combineReducers({
  app,
  projects,
  markdown,
  note,
  drive,
  exportQueue,
  routing: routerReducer,
  user,
});

export default rootReducer;
