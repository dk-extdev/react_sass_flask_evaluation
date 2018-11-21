/**
 * Created by rayde on 11/11/2017.
 */
import {put} from 'redux-saga/effects'
export const FETCH = 'FETCH';
export const CREATE = 'CREATE';
export const RECEIVE = 'RECEIVE';
export const ERROR = 'ERROR';
export const UPDATE = 'UPDATE';

export function* handleError(errorAction, message=null){
    if(message !== null){
        Materialize.toast(message, 4000, 'red');
    }
    yield put(errorAction());
}