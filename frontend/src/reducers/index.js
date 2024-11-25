import { combineReducers } from 'redux';
import terminReducer from './terminReducer';

const rootReducer = combineReducers({
  termini: terminReducer,
});

export default rootReducer;