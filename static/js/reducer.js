/**
 * Created by rayde on 11/1/2017.
 */
import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import user from './ducks/user'
import organization from './ducks/organization'
import landData from './ducks/landData'
import evaluation from './ducks/evaluation'

const AGValueApp = combineReducers({
    user,
    organization,
    landData,
    evaluation,
    routing: routerReducer
});


export default AGValueApp