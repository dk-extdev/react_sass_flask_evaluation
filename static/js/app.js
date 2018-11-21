/**
 * Created by rayde on 11/1/2017.
 */
//import 'promise-polyfill/src/polyfill';
import 'babel-polyfill'
import 'react-dates/initialize';
import React from 'react'
import { render } from 'react-dom'
import {browserHistory} from 'react-router'
import {createLogger} from 'redux-logger'
import { syncHistoryWithStore, routerMiddleware } from 'react-router-redux'
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import injectTapEventPlugin from 'react-tap-event-plugin';
import AGValueApp from './reducer'
import rootSaga from './saga'
import {fetchUser} from './ducks/user'
import {FETCH} from './ducks/constants'
import Root from './containers/Root'
import createRavenMiddleware from 'raven-for-redux'
import Cookies from 'universal-cookie'

const loggerMiddleware = createLogger();
const sagaMiddleware = createSagaMiddleware({
    onError: function(error){
        Raven.captureException(error);
    }
});

export const store = createStore(
    AGValueApp,
    applyMiddleware(routerMiddleware(browserHistory), sagaMiddleware, loggerMiddleware, createRavenMiddleware(Raven))
);

const history = syncHistoryWithStore(browserHistory, store);

sagaMiddleware.run(rootSaga);

store.dispatch(fetchUser(FETCH));

export const cookies = new Cookies();

render(
   <Root store={store} history={history}/>,
    document.getElementById('root')
);
