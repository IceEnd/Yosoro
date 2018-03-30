import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import app from './app';
import projects from './projects';
import markdown from './markdown';
import note from './note';
import driver from './driver';

const rootReducer = combineReducers({
  app,
  projects,
  markdown,
  note,
  driver,
  routing: routerReducer,
});

export default rootReducer;
