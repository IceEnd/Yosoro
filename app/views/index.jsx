import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { createLogger } from 'redux-logger';
import { AppContainer } from 'react-hot-loader';
import createSagaMiddleware from 'redux-saga';
// import { hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { createHashHistory } from 'history';
import { persistStore, persistReducer } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import storage from 'redux-persist/lib/storage';
import App from './container/App';
import rootReducer from './reducers/reducers';
import sagas from './sagas/sagas';

const loggerMiddleware = createLogger();
const sagaMiddleware = createSagaMiddleware();

/* eslint-disable no-underscore-dangle */
const composeEnhancers = typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose;
/* eslint-enable */

const enhancer = composeEnhancers(
  applyMiddleware(
    loggerMiddleware,
    sagaMiddleware,
  ),
);

const persistConfig = {
  key: 'edit',
  storage,
  blacklist: ['app', 'drive', 'projects', 'markdown', 'exportQueue', 'routing', 'user', 'imageHosting', 'medium'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = createStore(
  // rootReducer,
  persistedReducer,
  enhancer,
);

const persistor = persistStore(store);

const sagaLen = sagas.length;
for (let i = 0; i < sagaLen; i++) {
  sagaMiddleware.run(sagas[i]);
}

const history = createHashHistory();
syncHistoryWithStore(createHashHistory(), store);
// const history = syncHistoryWithStore(createHashHistory(), store);
// const history = syncHistoryWithStore(hashHistory, store);

const render = (Component) => {
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Component history={history} />
        </PersistGate>
      </Provider>
    </AppContainer>,
    document.querySelector('#root')
  );
};

render(App);

if (module.hot) {
  module.hot.accept('./container/App', () => {
    const newApp = require('./container/App').default;
    render(newApp);
  });
}
