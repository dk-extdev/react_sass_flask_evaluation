/**
 * Created by rayde on 11/11/2017.
 */
import { takeEvery, takeLatest } from 'redux-saga/effects'
import { put, call, select} from 'redux-saga/effects'
import * as actionTypes from './constants'
import {handleError} from './constants'
import {FETCH_ORG_USERS, FETCH_USER_INVITES, EDIT_ORG, UPDATE_OWN_ORG} from './organization'
import {store} from '../app'
import {UrlToDataURI} from '../helpers'


//api
const getUserAPI = () => {
    return fetch('/user/me', {
        method: 'GET',
        credentials: 'include'
    }).then(response => response.json());
};

const postLogOut = () => {
    return fetch('/logOut', {
        method: 'POST',
        credentials: 'include'
    }).then(response => response.json())
};

const requestPasswordResetAPI = (email) => {
    return fetch('/requestForgotPassword', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({email})
    }).then(response => response.json())
}


//action creators
const FETCH_USER = 'FETCH_USER';
export const fetchUser = (actionType, params = null) => {
    return Object.assign({}, {
        type: FETCH_USER,
        actionType
    }, params)
};

const LOG_OUT = 'LOG_OUT';
export const logOut = (actionType) => {
  return {
      type: LOG_OUT,
      actionType
  }
};

const REQUEST_PASSWORD_RESET = 'REQUEST_PASSWORD_RESET';
export const requestPasswordReset = (actionType, params=null) => {
    return Object.assign({}, {
        type: REQUEST_PASSWORD_RESET,
        actionType
    }, params);
};


// reducers
const initialState = {
    id: null,
    name: null,
    email: null,
    organization: null,
    roles: [],
    isFetching: false,
    hasFetched: false,
    areas: [], // These are the areas for the current users org.
    isFetchingAreas: false,
    counties: [], // These are the counties for the current users org
    isFetchingCounties: false,
    hasFetchedOwnOrgUsers: false,
    hasFetchedOwnUserInvites: false,
    isUpdatingOwnOrg: false,
    isRequestingNewPassword: false
};

const fetchUserReducer = (state, action) => {
    switch (action.actionType) {
        case actionTypes.FETCH:
            return Object.assign({}, state, {
                isFetching: true
            });
        case actionTypes.RECEIVE:
            return Object.assign({}, state, {
                id: action.user.id,
                name: action.user.name,
                email: action.user.email,
                organization: action.organization,
                roles: action.roles,
                isFetching: false,
                hasFetched: true,
                areas: action.areas,
                counties: action.counties
            });
        case actionTypes.ERROR:
            return Object.assign({}, state, {
                isFetching: false,
                hasFetched: true
            });
        default:
            return state;
    }
};

const fetchOwnOrgUsersReducer = (state, action) => {
  switch(action.actionType){
    case actionTypes.RECEIVE:
      if(action.orgId === state.organization.id){
        return Object.assign({}, state, {
          hasFetchedOwnOrgUsers: true
        });
      }
      return Object.assign({}, state, {
        hasFetchedOwnOrgUsers: false
      });
    default:
      return state;
  }
};

const fetchOwnUserInvitesReducer = (state, action) => {
  switch (action.actionType) {
    case actionTypes.RECEIVE:
        if(action.orgId === state.organization.id){
            return Object.assign({}, state, {
                hasFetchedOwnUserInvites: true
            });
        }
        return Object.assign({}, state, {
            hasFetchedOwnUserInvites: false
        });
    default:
        return state;
  }
}

const updatingOwnOrgReducer = (state, action) => {
    switch(action.actionType) {
        case actionTypes.UPDATE:
            if(action.orgId === state.organization.id) {
                  return Object.assign({}, state, {
                      isUpdatingOwnOrg: true
                  });
            }
            else if(action.orgId == null) { // Updating from the settings page.
                return Object.assign({}, state, {
                    isUpdatingOwnOrg: true
                })
            }
            return state;
        case actionTypes.RECEIVE:
            if(action.orgId === state.organization.id) {
                return Object.assign({}, state, {
                    isUpdatingOwnOrg: false,
                    organization: action.organization
                })
            }
            else if (action.orgId == null) {
                return Object.assign({}, state, {
                    isUpdatingOwnOrg: false,
                    organization: action.organization
                });
            }
            return state;
        case actionTypes.ERROR:
            if(action.orgId === state.organization.id) {
                  return Object.assign({}, state, {
                      isUpdatingOwnOrg: false
                  });
            }
            else if (action.orgId == null) {
                return Object.assign({}, state, {
                    isUpdatingOwnOrg: false
                })
            }
            return state;
        default:
            return state;
    }
}

const requestPasswordResetReducer = (state, action) => {
    switch(action.actionType) {
        case actionTypes.FETCH:
          return Object.assign({}, state, {
              isRequestingNewPassword: true
          });
        case actionTypes.RECEIVE:
          return Object.assign({}, state, {
              isRequestingNewPassword: false
          });
        case actionTypes.ERROR:
          return Object.assign({}, state, {
              isRequestingNewPassword: false
          });
        default:
          return state;
    }
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_USER:
            return fetchUserReducer(state, action);
        case FETCH_ORG_USERS:
            return fetchOwnOrgUsersReducer(state, action);
        case FETCH_USER_INVITES:
            return fetchOwnUserInvitesReducer(state, action);
        case EDIT_ORG:
            return updatingOwnOrgReducer(state, action);
        case REQUEST_PASSWORD_RESET:
            return requestPasswordResetReducer(state, action);
        case UPDATE_OWN_ORG:
            return updatingOwnOrgReducer(state, action);
        default:
            return state;
    }
};

export default reducer

//sagas
function* fetchUserSaga(action) {
    if (action.actionType === actionTypes.FETCH) {
        try {
            const response = yield call(getUserAPI);
            if (response.error) {
                yield handleError(() => fetchUser(actionTypes.ERROR), 'Error Fetching User: ' + response.message);
            }
            else {
                if(response.organization.logo != null){
                    // var xhr = new XMLHttpRequest();
                    // xhr.onload = function() {
                    //     var reader = new FileReader();
                    //     reader.onloadend = function() {
                    //         store.dispatch(fetchUser(actionTypes.RECEIVE, Object.assign({}, response, {
                    //             organization: Object.assign({}, response.organization, {
                    //                 logo: Object.assign({}, response.organization.logo, {
                    //                     fileURI: reader.result
                    //                 })
                    //             })
                    //         })));
                    //         // callback(reader.result);
                    //     }
                    //     reader.readAsDataURL(xhr.response);
                    // };
                    // xhr.open('GET', response.organization.logo.fileURL);
                    // xhr.responseType = 'blob';
                    // xhr.send();
                    const fileURI = yield call(UrlToDataURI, response.organization.logo.fileURL);
                    yield put(fetchUser(actionTypes.RECEIVE, Object.assign({}, response, {
                        organization: Object.assign({}, response.organization, {
                            logo: Object.assign({}, response.organization.logo, {
                                fileURI
                            })
                        })
                    })));
                }
                else {
                    yield put(fetchUser(actionTypes.RECEIVE, response));
                } 
                
            }
        }
        catch(e){
            yield handleError(() => fetchUser(actionTypes.ERROR), 'Error Fetching User: ' + (e.message == null ? e : e.message));
        }
    }

}

function* logOutSaga(action) {
    if(action.actionType) {
        try {
            const response = yield call(postLogOut);
            window.location.replace('/')
        }
        catch(e){
            window.location.replace('/')
        }
    }
}

function* requestPasswordResetSaga(action) {
    if (action.actionType === actionTypes.FETCH) {
        const errorFunc = () => requestPasswordReset(actionTypes.ERROR);
        try{
          const {email} = action;
          const response = yield call(requestPasswordResetAPI, email);
          if(response.error){
              yield handleError(errorFunc, 'Error Requesting Password Reset: ' + response.message);
          }
          else {
              yield put(requestPasswordReset(actionTypes.RECEIVE));
              Materialize.toast('Password Reset has been requested. Please check your email for a link to reset your password. It may be in the spam folder.', 8000);
          }
        }
        catch (e) {
            yield handleError(errorFunc, 'Error Request Password Reset: ' + JSON.stringify(e.message == null ? e : e.message));
        }
    }
}

export function* userSaga() {
    yield takeLatest(FETCH_USER, fetchUserSaga);
    yield takeEvery(LOG_OUT, logOutSaga);
    yield takeEvery(REQUEST_PASSWORD_RESET, requestPasswordResetSaga);
}
