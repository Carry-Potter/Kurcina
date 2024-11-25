import { createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk'; // Izmenjeno: uvozite thunk kao named export
import rootReducer from './reducers';

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;