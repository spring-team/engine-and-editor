// @flow

import thunk from 'redux-thunk'

import {createStore, applyMiddleware, compose, combineReducers} from 'redux'

import {reducer as notificationReducer} from 'react-notification-system-redux'
import userReducer from '../reducers/user'
import isProduction from '../utils/isProduction'

export default (reducers: {}) => {
    const middleware = [thunk]
    let toBeComposed = [applyMiddleware(...middleware)]

    if (!isProduction()) {
        if (window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()) {
            toBeComposed.push(window.__REDUX_DEVTOOLS_EXTENSION__())
        }
    }

    return createStore(
        combineReducers({
            notifications: notificationReducer,
            user: userReducer,
            ...reducers,
        }),
        compose.apply(null, toBeComposed),
    )
}
