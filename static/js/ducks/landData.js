/**
 * Created by rayde on 12/13/2017.
 */
import { takeEvery, takeLatest } from 'redux-saga/effects'
import { put, call, select} from 'redux-saga/effects'
import * as actionTypes from './constants'
import {handleError} from './constants'
import {push} from 'react-router-redux'

//api
const uploadLandData = (file, state, headerMapping) => {
    const form = new FormData();
    form.append('file', file);
    form.append('state', state);
    form.append('headerMapping', JSON.stringify(headerMapping));
    return fetch('/landData/import', {
        method: 'POST',
        credentials: 'include',
        body: form
    }).then(response => response.json());
};

const getLandData = (counties) => {
    return fetch(`/landData/?counties=${counties.join()}`, {
        method: 'GET',
        credentials: 'include'
    }).then(response => response.json());
};

// actions
const POST_LAND_DATA = 'POST_LAND_DATA';
export const postLandData = (actionType, params=null) => {
  return Object.assign({}, {
      type: POST_LAND_DATA,
      actionType
  }, params);
};

const FETCH_LAND_DATA = 'FETCH_LAND_DATA';
export const fetchLandData = (actionType, params = null) => {
  return Object.assign({}, {
      type: FETCH_LAND_DATA,
      actionType
  }, params);
};

//Reduers

const initialState = {
    isUploading: false,
    isFetchingCounties: false,
    hasFetchedCounties: false,
    counties: [],
    landData: [],
    isFetchingLandData: false
};

const updateLandDataReducer = (state, action) => {
  switch (action.actionType){
      case actionTypes.UPDATE:
          return Object.assign({}, state, {
              isUploading: true
          });
      case actionTypes.RECEIVE:
          return Object.assign({}, state, {
              isUploading: false
          });
      case actionTypes.ERROR:
          return Object.assign({}, state, {
              isUploading: false
          });
      default:
          return state;
  }
};

const fetchLandDataReducer = (state, action) => {
  switch(action.actionType){
      case actionTypes.FETCH:
          return Object.assign({}, state, {
              isFetchingLandData: true
          });
      case actionTypes.RECEIVE:
          return Object.assign({}, state, {
              isFetchingLandData: false,
              landData: action.landData
          });
      case actionTypes.ERROR:
          return Object.assign({}, state, {
              isFetchingLandData: false
          });
      default:
          return state;
  }
};

const reducer = (state=initialState, action) => {
    switch (action.type) {
        case POST_LAND_DATA:
            return updateLandDataReducer(state, action);
        case FETCH_LAND_DATA:
            return fetchLandDataReducer(state, action);
        default:
            return state;
    }
};

export default reducer

//sagas

function* uploadLandDataSaga(action){
    if(action.actionType === actionTypes.UPDATE){
        const {file, state, headerMapping} = action;
        const errorFunc = () => postLandData(actionTypes.ERROR);
        try{
            const response = yield call(uploadLandData, file, state, headerMapping);
            if(response.error){
                yield handleError(errorFunc, 'Error Uploading Land Data: ' + JSON.stringify(response.message));
            }
            else {
                Materialize.toast(response.message, 8000);
                yield put(postLandData(actionTypes.RECEIVE, response));
            }
        }
        catch(e){
            yield handleError(errorFunc, 'Error Uploading Land Data: ' + JSON.stringify(e.message == null ? e : e.message));
        }
    }
}

function* fetchLandDataSaga(action){
    if(action.actionType === actionTypes.FETCH){
        const errorFunc = () => fetchLandData(actionTypes.ERROR);
        try {
            const response = yield call(getLandData, action.counties);
            if(response.error){
                yield handleError(errorFunc, 'Error Fetching Land Data: ' + response.message);
            }
            else{
                yield put(fetchLandData(actionTypes.RECEIVE, response));
            }
        }
        catch(e){
            yield handleError(errorFunc, 'Error Fetching Land Data: ' + JSON.stringify(e.message == null ? e : e.message))
        }
    }
}

export function* landDataSaga(){
    yield takeLatest(POST_LAND_DATA, uploadLandDataSaga);
    yield takeLatest(FETCH_LAND_DATA, fetchLandDataSaga);
}
