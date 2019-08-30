import { configureStore, getDefaultMiddleware } from 'redux-starter-kit';
import logger from 'redux-logger';
import { reduxBatch } from '@manaflair/redux-batch';
import resources from './reducers/resources';

const reducer = {
    resources: resources.reducer,
};

const middleware = [...getDefaultMiddleware(), logger];

const store = configureStore({
    reducer,
    middleware,
    devTools: process.env.NODE_ENV !== 'production',
    enhancers: [reduxBatch],
});

export default store;
