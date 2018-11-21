/**
 * Created by rayde on 11/14/2017.
 */
import { takeEvery, takeLatest } from 'redux-saga/effects'
import { put, call, select} from 'redux-saga/effects'
import * as actionTypes from './constants'
import {handleError} from './constants'
import {push} from 'react-router-redux'

//TODO:
// Create a user invite DUCKS and then call it in the createOrgSaga after Org is created.
// Then Create the UI around user invites on the create org page.
// Then create an Org Profile page where Curt can delete organizations, edit, delete users, restrict users, invite more users, and suspend organizaitons

//api
const getOrgs = () => {
    return fetch('/organization/', {
        method: 'GET',
        credentials: 'include'
    }).then(response => response.json())
};

const postOrg = (payload) => {
    return fetch('/organization/', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    }).then(response => response.json());
};

const postUserInvite = (payload) => {
    return fetch('/user/invite', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    }).then(response => response.json());
};

const postDeleteUserInvite = (inviteId) => {
  return fetch(`/user/invite/${inviteId}`, {
    method: 'DELETE',
    credentials: 'include'
  }).then(response => response.json())
}

const getUserInvites = (orgId) => {
    return fetch(`/user/invite?orgId=${orgId}`, {
        method: 'GET',
        credentials: 'include'
    }).then(response => response.json())
};

const getOrgUsers = (orgId) => {
    return fetch(`/organization/${orgId}/user`, {
        method: 'GET',
        credentials: 'include'
    }).then(response => response.json())
};

const getAllCounties = () => {
    return fetch(`/county`, {
        method: 'GET',
        credentials: 'include'
    }).then(response => response.json())
};

const postOrgCounties = (orgId, counties) => {
  return fetch(`/organization/${orgId}/county`, {
      method: 'POST',
      credentials: 'include',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({counties})
  }).then(response => response.json());
};

const postOrgAreas = (orgId, areas) => {
    return fetch(`/organization/${orgId}/area`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({areas})
    }).then(response => response.json());
};

const updateOrg = (orgId, params) => {
  return fetch(`/organization/${orgId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  }).then(response => response.json());
};

const destroyArea = (orgId, areaId) => {
  return fetch(`/organization/${orgId}/area/${areaId}`, {
    method: 'DELETE',
    credentials: 'include'
  }).then(response => response.json());
};

const disableEnableUserAPI = (userId) => {
    return fetch(`/user/${userId}/disable`, {
        method:'POST',
        credentials: 'include'
    }).then(response => response.json())
};

const disableEnableOrgAPI = (orgId) => {
    return fetch(`/organization/${orgId}/disable`, {
        method: 'POST',
        credentials: 'include'
    }).then(response => response.json());
};

const putUpdateOwnOrganization = (payload) => {
    return fetch(`/organization/me`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    }).then(response => response.json())
}


//actions

const FETCH_ORGS = 'FETCH_ORGS';
export const fetchOrgs = (actionType, params = null) => {
    return Object.assign({}, {
        type: FETCH_ORGS,
        actionType
    }, params);
};

const CREATE_ORG = 'CREATE_ORG';
export const createOrg = (actionType, params = null) => {
    return Object.assign({}, {
        type: CREATE_ORG,
        actionType
    }, params);
};

const CREATE_USER_INVITE = 'CREATE_USER_INVITE';
export const createUserInvite = (actionType, params = null) => {
    return Object.assign({}, {
        type: CREATE_USER_INVITE,
        actionType
    }, params);
};

const WIPE_LOCAL_USER_INVITES = 'WIPE_LOCAL_USER_INVITES';
export const wipeLocalUserInvites = () => {
    return {
        type: WIPE_LOCAL_USER_INVITES
    }
};

export const FETCH_ORG_USERS = 'FETCH_ORG_USERS';
export const fetchOrgUsers = (actionType, params = null) => {
  return Object.assign({}, {
      type: FETCH_ORG_USERS,
      actionType
  }, params);
};

export const FETCH_USER_INVITES = 'FETCH_USER_INVITES';
export const fetchUserInvites = (actionType, params = null) => {
    return Object.assign({}, {
        type: FETCH_USER_INVITES,
        actionType
    }, params);
};

const FETCH_ALL_COUNTIES = 'FETCH_ALL_COUNTIES';
export const fetchAllCounties = (actionType, params = null) => {
  return Object.assign({}, {
      type: FETCH_ALL_COUNTIES,
      actionType
  }, params);
};

const ADD_AREAS = 'ADD_AREAS';
export const addAreas = (actionType, params = null) => {
    return Object.assign({}, {
        type: ADD_AREAS,
        actionType
    }, params);
};

const DELETE_LOCAL_USER_INVITE = 'DELETE_LOCAL_USER_INVITE';
const deleteLocalUserInvite = (inviteId) => {
  return {
    type: DELETE_LOCAL_USER_INVITE,
    inviteId
  };
};

const DELETE_USER_INVITE = 'DELETE_USER_INVITE';
export const deleteUserInvite = (actionType, params = null) => {
  return Object.assign({}, {
    type: DELETE_USER_INVITE,
    actionType
  }, params);
};

export const EDIT_ORG = 'EDIT_ORG';
export const editOrg = (actionType, params = null) => {
  return Object.assign({}, {
    type: EDIT_ORG,
    actionType
  }, params);
};

const DELETE_AREA = 'DELETE_AREA';
export const deleteArea = (actionType, params = null) => {
  return Object.assign({}, {
    type: DELETE_AREA,
    actionType
  }, params);
};

const DISABLE_ENABLE_USER = 'DISABLE_ENABLE_USER';
export const disableEnableUser = (actionType, params = null) => {
    return Object.assign({}, {
        type: DISABLE_ENABLE_USER,
        actionType
    }, params);
};

const DISABLE_ENABLE_ORG = 'DISABLE_ENABLE_ORG';
export const disableEnableOrg = (actionType, params = null) => {
    return Object.assign({}, {
        type: DISABLE_ENABLE_ORG,
        actionType
    }, params);
}

export const UPDATE_OWN_ORG = 'UPDATE_OWN_ORG';
export const updateOwnOrg = (actionType, params = null) => {
    return Object.assign({}, {
        type: UPDATE_OWN_ORG,
        actionType
    }, params);
};

//reducer
const initialState = {
    organizations: [],
    isFetching: false,
    hasFetched: false,
    isCreating: false,
    isFetchingUserInvites: false,
    hasFetchedUserInvites: false,
    userInvites: [],
    orgUsers: [],
    isFetchingOrgUsers: false,
    counties: [], // These are all the counties.
    isFetchingCounties: false,
    isCreatingAreas: false,
    isSendingUserInvite: false,
    isUpdatingOrg: false
};

const fetchOrgsReducer = (state, action) => {
    switch (action.actionType) {
        case actionTypes.FETCH:
            return Object.assign({}, state, {
                isFetching: true
            });
        case actionTypes.RECEIVE:
            return Object.assign({}, state, {
                isFetching: false,
                hasFetched: true,
                organizations: action.organizations
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

const createOrgReducer = (state, action) => {
    switch (action.actionType) {
        case actionTypes.CREATE:
            return Object.assign({}, state, {
                isCreating: true
            });
        case actionTypes.RECEIVE:
            return Object.assign({}, state, {
                isCreating: false,
                organizations: [action.organization].concat(state.organizations)
            });
        case actionTypes.ERROR:
            return Object.assign({}, state, {
                isCreating: false
            });
        default:
            return state;
    }
};

const createUserInviteReducer = (state, action) => {
    let lookupId;
    switch (action.actionType) {
        case actionTypes.CREATE:
            if (action.existing) {
                return Object.assign({}, state, {
                    userInvites: state.userInvites.map((invite) => {
                        if (invite.id === action.id) {
                            return Object.assign({}, invite, {isSending: true});
                        }
                        return invite;
                    }),
                    isSendingUserInvite: true
                });
            }
            return Object.assign({}, state, {
                userInvites: state.userInvites.concat(action.userInvite),
                isSendingUserInvite: true
            });
        case actionTypes.RECEIVE:
            lookupId = action.existing ? 'id' : 'tempId';
            return Object.assign({}, state, {
                userInvites: state.userInvites.map((invite) => {
                    if (invite[lookupId] === action[lookupId]) {
                        return Object.assign({}, action.userInvite, {isSending: false});
                    }
                    return invite;
                }),
                isSendingUserInvite: false
            });
        case actionTypes.ERROR:
            lookupId = action.existing ? 'id' : 'tempId';
            return Object.assign({}, state, {
                userInvites: state.userInvites.map((invite) => {
                    if (invite[lookupId] === action[lookupId]) {
                        return Object.assign({}, invite, {isSending: false});
                    }
                    return invite;
                }),
                isSendingUserInvite: false
            });
        default:
            return state;
    }
};


const fetchUserInvitesReducer = (state, action) => {
    switch (action.actionType) {
        case actionTypes.FETCH:
            return Object.assign({}, state, {
                isFetchingUserInvites: true
            });
        case actionTypes.RECEIVE:
            return Object.assign({}, state, {
                isFetchingUserInvites: false,
                hasFetchedUserInvites: true,
                userInvites: action.userInvites
            });
        case actionTypes.ERROR:
            return Object.assign({}, state, {
                isFetchingUserInvites: false,
                hasFetchedUserInvites: true
            });
        default:
            return state;
    }
};

const fetchOrgUsersReducer = (state, action) => {
    switch (action.actionType){
        case actionTypes.FETCH:
            return Object.assign({}, state, {
                isFetchingOrgUsers: true
            });
        case actionTypes.RECEIVE:
            return Object.assign({}, state, {
                isFetchingOrgUsers: false,
                orgUsers: action.users
            });
        case actionTypes.ERROR:
            return Object.assign({}, state, {
                isFetchingOrgUsers: false
            });
        default:
            return state;
    }
};

const fetchAllCountiesReducer = (state, action) => {
    switch(action.actionType){
        case actionTypes.FETCH:
            return Object.assign({}, state, {
                isFetchingCounties: true
            });
        case actionTypes.RECEIVE:
            return Object.assign({}, state, {
                isFetchingCounties: false,
                counties: action.counties
            });
        case actionTypes.ERROR:
            return Object.assign({}, state, {
                isFetchingCounties: false
            });
        default:
            return state;
    }
};

const addAreasReducer = (state, action) => {
  switch (action.actionType){
      case actionTypes.CREATE:
          return Object.assign({}, state, {
              isCreatingAreas: true
          });
      case actionTypes.RECEIVE:
          return Object.assign({}, state, {
              isCreatingAreas: false,
              organizations: state.organizations.map((org) => {
                  if(org.id === action.orgId){
                      org.counties = action.counties;
                      org.areas = action.areas;
                  }
                  return org;
              })
          });
      case actionTypes.ERROR:
          return Object.assign({}, state, {
              isCreatingAreas: false
          });
      default:
          return state;
  }
};

const deleteUserInviteReducer = (state, action) => {
  switch(action.actionType){
    case actionTypes.ERROR:
          return Object.assign({}, state, {
            userInvites: state.userInvites.concat(action.userInvite)
          });
    default:
      return state;
  }
};

const updateOrgReducer = (state, action) => {
  switch(action.actionType) {
    case actionTypes.UPDATE:
        return Object.assign({}, state, {
            isUpdatingOrg: true
        });
    case actionTypes.RECEIVE:
        return Object.assign({}, state, {
            isUpdatingOrg: false,
            organizations: state.organizations.map((org) => {
                if(org.id === action.orgId) {
                    return action.organization
                }
                return org;
            })
        });
    case actionTypes.ERROR:
        return Object.assign({}, state, {
              isUpdatingOrg: false
        });
    default:
        return state;
  }
};

const deleteAreaReducer = (state, action) => {
    switch(action.actionType) {
        case actionTypes.FETCH:
            return Object.assign({}, state, {
                isDeletingAreas: true
            });
        case actionTypes.UPDATE:
            return Object.assign({}, state, {
                organizations: state.organizations.map((org) => {
                    if(org.id == action.orgId){
                        org.areas = org.areas.filter((area) => area.id !== action.areaId)
                    }
                    return org;
                })
            })
        case actionTypes.RECEIVE:
            return Object.assign({}, state, {
                isDeletingAreas: false
            });
        case actionTypes.ERROR:
            return Object.assign({}, state, {
                isDeletingAreas: false,
                organizations: state.organizations.map((org) => {
                    if(org.id == action.orgId){
                        org.areas = org.areas.concat(action.areas)
                    }
                    return org;
                })
            })
        default:
            return state;
    }
}

const disableEnableUserReducer = (state, action) => {
    switch(action.actionType){
        case actionTypes.UPDATE:
            return Object.assign({}, state, {
                orgUsers: state.orgUsers.map((user) => {
                    if (user.id === parseInt(action.userId)){
                        return Object.assign({}, user, {
                            disabled: user.disabled == null ? true : !user.disabled
                        });
                    }
                    return user;
                })
            });
        case actionTypes.ERROR:
            return Object.assign({}, state, {
                orgUsers: state.orgUsers.map((user) => {
                    if (user.id === parseInt(action.userId)) {
                        return Object.assign({}, user, {
                            disabled: !user.disabled
                        });
                    }
                    return user;
                })
            });
        default:
            return state;
    }
}

const disableEnableOrgReducer = (state, action) => {
    switch (action.actionType) {
        case actionTypes.UPDATE:
            return Object.assign({}, state, {
                organizations: state.organizations.map((org) => {
                    if(org.id === parseInt(action.orgId)){
                        return Object.assign({}, org, {
                            disabled: org.disabled == null ? true : !org.disabled
                        });
                    }
                    return org;
                })
            });
        case actionTypes.ERROR:
            return Object.assign({}, state, {
                organizations: state.organizaitons.map((org) => {
                    if(org.id === parseInt(action.orgId)){
                        return Object.assign({}, org, {
                            disabled: !org.disabled
                        });
                    }
                    return org;
                })
            });
        default:
            return state;
    }
}

const updateOwnOrgReducer = (state, action) => {
    switch(action.actionType) {
      case actionTypes.UPDATE:
          return Object.assign({}, state, {
              isUpdatingOrg: true
          });
      case actionTypes.RECEIVE:
          return Object.assign({}, state, {
              isUpdatingOrg: false,
              organizations: state.organizations.map((org) => {
                  if(org.id == action.organization.id){
                      return action.organization;
                  }
                  return org;
              })
          });
      case actionTypes.ERROR:
          return Object.assign({}, state, {
              isUpdatingOrg: false
          });
      default:
          return state;
    }
}


const reducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_ORGS:
            return fetchOrgsReducer(state, action);
        case CREATE_ORG:
            return createOrgReducer(state, action);
        case WIPE_LOCAL_USER_INVITES:
            return Object.assign({}, state, {
                userInvites: [],
                isFetchingUserInvites: false,
                hasFetchedUserInvites: false
            });
        case CREATE_USER_INVITE:
            return createUserInviteReducer(state, action);
        case FETCH_USER_INVITES:
            return fetchUserInvitesReducer(state, action);
        case FETCH_ORG_USERS:
            return fetchOrgUsersReducer(state, action);
        case FETCH_ALL_COUNTIES:
            return fetchAllCountiesReducer(state, action);
        case ADD_AREAS:
            return addAreasReducer(state, action);
        case DELETE_USER_INVITE:
            return deleteUserInviteReducer(state, action);
        case DELETE_LOCAL_USER_INVITE:
            return Object.assign({}, state, {
                userInvites: state.userInvites.filter((invite) => invite.id !== action.inviteId)
            });
        case EDIT_ORG:
            return updateOrgReducer(state, action);
        case DELETE_AREA:
            return deleteAreaReducer(state, action);
        case DISABLE_ENABLE_USER:
            return disableEnableUserReducer(state, action);
        case DISABLE_ENABLE_ORG:
            return disableEnableOrgReducer(state, action);
        case UPDATE_OWN_ORG:
            return updateOwnOrgReducer(state, action);
        default:
            return state;
    }
};

export default reducer


//sagas
function* fetchOrgsSaga(action) {
    if (action.actionType === actionTypes.FETCH) {
        const errorFunc = () => fetchOrgs(actionTypes.ERROR);
        try {
            const response = yield call(getOrgs);
            if (response.error) {
                handleError(errorFunc, response.message);
            }
            else {
                yield put(fetchOrgs(actionTypes.RECEIVE, response));
            }
        }
        catch (e) {
            handleError(errorFunc, e.message == null ? e : e.message);
        }
    }
}

const getUserInviteStore = (state) => state.organization.userInvites;
function* createOrgSaga(action) {
    if (action.actionType === actionTypes.CREATE) {
        const errorFunc = () => createOrg(actionTypes.ERROR);
        try {
            const {organization, userInvites} = action;
            const response = yield call(postOrg, organization);
            if (response.error) {
                yield handleError(errorFunc, JSON.stringify(response.message));
            }
            else {
                // Dispatch an action for every user invite.
                for(let i = 0; i < userInvites.length; i++){
                    yield put(createUserInvite(actionTypes.CREATE,
                        {tempId: userInvites[i].tempId, existing: false,
                            userInvite: Object.assign({}, userInvites[i], {orgId: response.organization.id})}))
                }
                // Waiting until all userInvites return either a success or error.
                let curUserInvites = yield select(getUserInviteStore);
                while (curUserInvites.reduce((bool, invite) => bool || invite.isSending, false)) {
                    yield take();
                    curUserInvites = yield select(getUserInviteStore);
                }
                // finish the org creation and go back to org page.
                yield put(createOrg(actionTypes.RECEIVE, response));
                Materialize.toast('Organization was created Successfully', 4000);
                yield put(push('/organizations'));
            }
        }
        catch (e) {
            yield handleError(errorFunc, JSON.stringify(e.message == null ? e : e.message));
        }
    }
}

function* createUserInviteSaga(action) {
    if (action.actionType === actionTypes.CREATE) {
        const errorFunc = () =>  createUserInvite(actionTypes.ERROR);
        const {existing, userInvite} = action;
        try {
            let idField = existing ? 'id' : 'tempId';
            let id = existing ? action.id : action.tempId;
            const response = yield call(postUserInvite, userInvite);
            if (response.error) {
                yield handleError(errorFunc, `Error Inviting User, ${userInvite.email}: ${JSON.stringify(response.message)}`)
            }
            else {
                Materialize.toast(`${userInvite.email} successfully invited - the user may need to check their spam folder.`, 6000);
                let respAction = {existing, userInvite: response.userInvite};
                respAction[idField] = id;
                yield put(createUserInvite(actionTypes.RECEIVE, respAction));
            }
        }
        catch (e) {
            yield handleError(errorFunc, `Error Inviting User, ${userInvite.email}: ${JSON.stringify(e.message == null ? e : e.message)}`);
        }
    }
}

function* fetchUserInvitesSaga(action) {
    if (action.actionType === actionTypes.FETCH) {
        const errorFunc = () => fetchUserInvites(actionTypes.ERROR);
        try {
            const {orgId} = action;
            const response = yield call(getUserInvites, orgId);
            if(response.error){
                yield handleError(errorFunc, `Error fetching user invites: ${JSON.stringify(response.message)}`);
            }
            else {
                yield put(fetchUserInvites(actionTypes.RECEIVE, Object.assign({}, response, {orgId})));
            }
        }
        catch (e) {
            yield handleError(errorFunc, `Error fetching user invites: ${JSON.stringify(e.message == null ? e : e.message)}`);
        }
    }
}

function* fetchOrgUsersSaga(action) {
    if(action.actionType === actionTypes.FETCH){
        const errorFunc = () => fetchOrgUsers(actionTypes.ERROR);
        try {
            const {orgId} = action;
            const response = yield call(getOrgUsers, orgId);
            if(response.error){
                yield handleError(errorFunc, `Error fetching users:  ${JSON.stringify(response.message)}`)
            }
            else {
                yield put(fetchOrgUsers(actionTypes.RECEIVE, Object.assign({}, response, {
                  orgId
                })));
            }
        }
        catch(e){
             yield handleError(errorFunc, `Error fetching users:  ${JSON.stringify(e.message == null ? e : e.message)}`)
        }
    }
}

function* fetchAllCountiesSaga(action){
    if(action.actionType === actionTypes.FETCH){
        const errorFunc = () => fetchAllCounties(actionTypes.ERROR);
        try {
            const response = yield call(getAllCounties);
            if(response.error){
                yield handleError(errorFunc, `Error Fetching All Counties: ${JSON.stringify(response.message)}`);
            }
            else {
                yield put(fetchAllCounties(actionTypes.RECEIVE, response));
            }
        }
        catch(e){
            yield handleError(errorFunc, `Error Fetching All Counties: ${JSON.stringify(e.message == null ? e : e.message)}`)
        }
    }
}

function* addAreasSaga(action){
    if(action.actionType === actionTypes.CREATE){
        const errorFunc = () => addAreas(actionTypes.ERROR);
        try {
            const {counties, areas, orgId} = action;
            const countyResp = yield call(postOrgCounties, orgId, counties);
            if(countyResp.error){
                yield handleError(errorFunc, 'Error adding Counties: ' + countyResp.message);
                return;
            }
            const areaResp = yield call(postOrgAreas, orgId, areas);
            if(areaResp.error){
                yield handleError(errorFunc, 'Error adding Areas: ' + areaResp.message);
                return;
            }
            yield put(addAreas(actionTypes.RECEIVE, {orgId, counties: countyResp.counties, areas: areaResp.areas}));
        }
        catch (e){
            yield handleError(errorFunc, 'Error Adding Counties/Areas : ' + JSON.stringify(e.message == null ? e : e.message));
        }
    }
}

const selectUserInvites = (state) => state.organization.userInvites;
function* deleteUserInviteSaga(action){
    if(action.actionType === actionTypes.UPDATE){
      const {inviteId} = action;
      const userInvites = yield select(selectUserInvites);
      const userInvite = userInvites.find((invite) => invite.id === parseInt(inviteId));
      const errorFunc = () => deleteUserInvite(actionTypes.ERROR, {userInvite});
      try {
          yield put(deleteLocalUserInvite(parseInt(inviteId)))
          const deleteResp = yield call(postDeleteUserInvite, parseInt(inviteId));
          if(deleteResp.error){
              yield handleError(errorFunc, 'Error deleting User Invite: ' + deleteResp.message);
          }
          else {
            Materialize.toast('User Invite Deleted.', 6000);
          }
      }
      catch(e){
          yield handleError(errorFunc, 'Error deleting User Invite: ' + JSON.stringify(e.message == null ? e : e.message));
      }
    }
}

function* editOrgSaga(action) {
    if(action.actionType === actionTypes.UPDATE) {
        const {orgId, params} = action;
        const errorFunc = () => editOrg(actionTypes.ERROR, {orgId});
        try {
            const response = yield call(updateOrg, orgId, params)
            if(response.error){
                yield handleError(errorFunc, 'Error updating Organization: ' + response.message);
            }
            else {
                yield put(editOrg(actionTypes.RECEIVE, {orgId, organization: response.organization}));
            }
        }
        catch (e) {
            yield handleError(errorFunc, 'Error updating Organization: ' + JSON.stringify(e.message == null ? e : e.message));
        }
    }
}

const selectOrganizations = (state) => state.organization.organizations
function* deleteAreaSaga (action) {
  if(action.actionType === actionTypes.FETCH){
    const {orgId, areaId} = action;
    const organizaitons = yield select(selectOrganizations);
    const org = organizaitons.find((o) => o.id == orgId);
    const deletedArea = org.areas.filter((a) => areaId === a.id);
    const errorFunc = () => deleteArea(actionTypes.ERROR, {orgId, areas: [deletedAreas]})
    try{
      yield put(deleteArea(actionTypes.UPDATE, {orgId, areaId}));
      const response = yield call(destroyArea, orgId, areaId)
      if(response.error){
          yield handleError(errorFunc, 'Error Deleteing Areas: ' + response.message);
      }
      else {
        yield put(deleteArea(actionTypes.RECEIVE));
        Materialize.toast('Area deleted', 6000);
      }
    }
    catch(e){
      yield handleError(errorFunc, 'Error Deleteing Areas: ' + JSON.stringify(e.message == null ? e : e.message));
    }

  }
}

function* disableEnableUserSaga(action) {
    if(action.actionType === actionTypes.UPDATE) {
        const {userId} = action;
        const errorFunc = () => disableEnableUser(actionTypes.ERROR, {userId});
        try {
            const response = yield call(disableEnableUserAPI, userId);
            if(response.error){
                yield handleError(errorFunc, 'Error Disabling User: ' + response.message);
            }
            else {
                Materialize.toast(response.user.disabled ? 'Successfully Disabled User!' : 'Successfully Enabled User!', 6000);
            }
        }
        catch (e) {
            yield handleError(errorFunc, 'Error Disabling User: ' + JSON.stringify(e.message == null ? e : e.message))
        }
    }
}

function* disableEnableOrgSaga(action) {
    if(action.actionType === actionTypes.UPDATE) {
        const {orgId} = action;
        const errorFunc = () => disableEnableOrg(actionTypes.ERROR, {orgId});
        try {
            const response = yield call(disableEnableOrgAPI, orgId);
            if(response.error){
                yield handleError(errorFunc, 'Error Disabling Org: ' + response.message);
            }
            else {
                Materialize.toast(response.org.disabled ? 'Successfully disabled organization!' : 'Successfully enabled organization', 6000);
            }
        }
        catch (e) {
            yield handleError(errorFunc, 'Error Disabling Org: ' + JSON.stringify(e.message == null ? e : e.message));
        }
    }
}

function* updateOwnOrgSaga (action) {
    if(action.actionType === actionTypes.UPDATE) {
        const errorFunc = () =>  updateOwnOrg(actionTypes.ERROR);
        try {
            let payload = {};
            const {primaryColor, logo} = action;
            if(logo != null) {
                payload['logo'] = logo;
            }

            if (primaryColor != null) {
                payload['primaryColor'] = primaryColor;
            }

            const response = yield call(putUpdateOwnOrganization, payload);

            if(response.error){
                yield handleError(errorFunc, 'Error Saving Organization: ' + response.message);
            }
            else {
                yield put(updateOwnOrg(actionTypes.RECEIVE, {organization: response.organization}));
                Materialize.toast('Organization has been updated', 7000);
            }
        }
        catch (e) {
            yield handleError(errorFunc, 'Error Saving Organization: ' + JSON.stringify(e.message == null ? e : e.message));
        }
    }
}

export function* orgSaga() {
    yield takeEvery(FETCH_ORGS, fetchOrgsSaga);
    yield takeEvery(CREATE_ORG, createOrgSaga);
    yield takeEvery(CREATE_USER_INVITE, createUserInviteSaga);
    yield takeEvery(FETCH_USER_INVITES, fetchUserInvitesSaga);
    yield takeEvery(FETCH_ORG_USERS, fetchOrgUsersSaga);
    yield takeEvery(FETCH_ALL_COUNTIES, fetchAllCountiesSaga);
    yield takeEvery(ADD_AREAS, addAreasSaga);
    yield takeEvery(DELETE_USER_INVITE, deleteUserInviteSaga);
    yield takeEvery(EDIT_ORG, editOrgSaga);
    yield takeEvery(DELETE_AREA, deleteAreaSaga)
    yield takeEvery(DISABLE_ENABLE_USER, disableEnableUserSaga);
    yield takeEvery(DISABLE_ENABLE_ORG, disableEnableOrgSaga);
    yield takeEvery(UPDATE_OWN_ORG, updateOwnOrgSaga);
}
