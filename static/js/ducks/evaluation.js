/**
 * Created by rayde on 1/5/2018.
 */
import { takeEvery, takeLatest } from 'redux-saga/effects'
import { put, call, select} from 'redux-saga/effects'
import * as actionTypes from './constants'
import {handleError} from './constants'
import {push} from 'react-router-redux'
import generatePDF from './generatePDF'
import AWS from 'aws-sdk'
import {store} from '../app'
import moment from 'moment'
import {UrlToDataURI} from '../helpers'

//api
const getEvaluations = (orgId) => {
    return fetch(`/evaluation/?orgId=${orgId}`, {
        credentials: 'include',
        method: 'GET'
    }).then(response => response.json())
};

const postEvaluation = (payload) => {
    return fetch(`/evaluation/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    }).then(response => response.json())

};

const postPDF = (file, filename) => {
    const form = new FormData();
    form.append('file', file);
    form.append('filename', filename);
    return fetch(`/evaluation/upload_file`, {
        method: 'POST',
        credentials: 'include',
        body: form
    }).then(response => response.json());
}

const postPicture = (file, filename) => {
    const form = new FormData();
    form.append('file', file);
    form.append('filename', filename);
    return fetch(`/evaluation/upload_picture`, {
        method: 'POST',
        credentials: 'include',
        body: form
    }).then(response => response.json());
}

const putEvaluation = (evalId, payload) => {
    return fetch(`/evaluation/${evalId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    }).then(response => response.json());
}

const deleteEvaluationAPI = (evalId) => {
    return fetch(`/evaluation/${evalId}`, {
        method: 'DELETE',
        credentials: 'include'
    }).then(response => response.json())
}

const fetchEvaluationSaveLogAPI = (orgId) => {
    return fetch(`/evaluation/saves?orgId=${orgId}`, {
        method: 'GET',
        credentials: 'include'
    }).then(response => response.json());
}

const getEvalById = (evalId) => {
    return fetch(`/evaluation/${evalId}`, {
        method: 'GET',
        credentials: 'include'
    }).then(response => response.json())
}

//actions
const FETCH_EVALUATIONS = 'FETCH_EVALUATIONS';
export const fetchEvaluations = (actionType, params = null) => {
    return Object.assign({}, {
        type: FETCH_EVALUATIONS,
        actionType
    }, params)
};


const CREATE_EVALUATION = 'CREATE_EVALUATION';
export const createEvaluation = (actionType, params = null) => {
    return Object.assign({}, {
        type: CREATE_EVALUATION,
        actionType
    }, params);
};

const DOWNLOAD_PDF = 'DOWNLOAD_PDF';
export const downloadPDF = (actionType, params = null) => {
    return Object.assign({}, {
        type: DOWNLOAD_PDF,
        actionType
    }, params);
};

const UPDATE_EVALUATION = 'UPDATE_EVALUATION';
export const updateEvaluation = (actionType, params = null) => {
    return Object.assign({}, {
        type: UPDATE_EVALUATION,
        actionType
    }, params)
}

const UPDATE_SAVE_PROGRESS_TOTAL = 'UPDATE_SAVE_PROGRESS_TOTAL';
export const updateSaveProgressTotal = (saveProgressTotal) => {
  return {
    type: UPDATE_SAVE_PROGRESS_TOTAL,
    saveProgressTotal
  };
};

const INCREMENT_SAVE_PROGRESS = 'INCREMENT_SAVE_PROGRESS';
export const incrementSaveProgress = () => {
  return {
    type: INCREMENT_SAVE_PROGRESS
  };
};

const RESET_SAVE_PROGRESS = 'RESET_SAVE_PROGRESS';
export const resetSaveProgress = () => {
  return {
    type: RESET_SAVE_PROGRESS
  };
};

const DELETE_EVALUATION = 'DELETE_EVALUATION';
export const deleteEvaluation = (actionType, params = null) => {
    return Object.assign({}, {
      type: DELETE_EVALUATION,
      actionType
    }, params);
};

const CLEAR_EVALUATIONS_CACHE = 'CLEAR_EVALUATIONS_CACHE';
export const clearEvaluationsCache = () => {
    return {
      type: CLEAR_EVALUATIONS_CACHE
    }
}

const FETCH_EVALUATION_SAVE_LOG = 'FETCH_EVALUATION_SAVE_LOG';
export const fetchEvaluationSaveLog = (actionType, params = null) => {
    return Object.assign({}, {
        type: FETCH_EVALUATION_SAVE_LOG,
        actionType
    }, params);
}

const FETCH_EVALUATION_BY_ID = 'FETCH_EVALUATION_BY_ID';
export const fetchEvaluationById = (actionType, params = null) => {
    return Object.assign({}, {
        type: FETCH_EVALUATION_BY_ID,
        actionType
    }, params);
}

const IMAGE_LOAD_COMPLETE = 'IMAGE_LOAD_COMPLETE';
export const imageLoadComplete = (evalId, imageType, fileURI, index=null) => {
    return {
        type: IMAGE_LOAD_COMPLETE,
        evalId,
        imageType,
        index,
        fileURI
    }
}

const UPDATE_PDF_URI = 'UPDATE_PDF_URI';
const updatePDFURI = (id, pdfURI) => {
    return {
        type: UPDATE_PDF_URI,
        id,
        pdfURI
    }
}
//reducer


const initialState = {
    isFetching: false,
    isPosting: false,
    hasFetched: false,
    evaluations: [],
    newEvaluation: null,
    isPDFDownloading: false,
    saveProgressTotal: 1,
    saveProgress: 0,
    isDeleting: false,
    isFetchingSaveLog: false,
    evaluationSaveLog: [],
    isFetchingSingle: false
};

const fetchEvaluationsReducer = (state, action) => {
    switch (action.actionType) {
        case actionTypes.FETCH:
            return Object.assign({}, state, {
                isFetching: true
            });
        case actionTypes.RECEIVE:
            return Object.assign({}, state, {
                isFetching: false,
                hasFetched: true,
                evaluations: action.evaluations.map((e) => {
                    if(state.evaluations.find((ev) => ev.id == e.id)){
                        return state.evaluations.find((ev) => ev.id == e.id);
                    }
                    return e;
                })
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

const createEvaluationReducer = (state, action) => {
    switch (action.actionType) {
        case actionTypes.CREATE:
            return Object.assign({}, state, {
                isPosting: true
            });
        case actionTypes.RECEIVE:
            return Object.assign({}, state, {
                isPosting: false,
                newEvaluation: null,
                evaluations: [action.evaluation].concat(state.evaluations)
            });
        case actionTypes.ERROR:
            return Object.assign({}, state, {
                isPosting: false
            });
        default:
            return state;
    }
};

const updateEvaluationReducer = (state, action) => {
    switch (action.actionType) {
        case actionTypes.UPDATE:
            return Object.assign({}, state, {
                isPosting: true
            });
        case actionTypes.RECEIVE:
            return Object.assign({}, state, {
                isPosting: false,
                evaluations: state.evaluations.map((e) => {
                    if (e.id === action.evalId) {
                        return action.evaluation;
                    }
                    return e;
                })
            });
        case actionTypes.ERROR:
            return Object.assign({}, state, {
                isPosting: false
            });
        default:
            return state;
    }
}

const downloadPDFReducer = (state, action) => {
    switch (action.actionType) {
        case actionTypes.FETCH:
            return Object.assign({}, state, {
                isPDFDownloading: true
            });
        case actionTypes.RECEIVE:
            if (action.pdfCreation) {
                return state;
            }
            return Object.assign({}, state, {
                isPDFDownloading: false
            });
        case actionTypes.ERROR:
            return Object.assign({}, state, {
                isPDFDownloading: false
            });
        default:
            return state;
    }
};

const deleteEvaluationReducer = (state, action) => {
    switch (action.actionType) {
      case actionTypes.FETCH:
          return Object.assign({}, state, {
              isDeleting: true
          });
      case actionTypes.UPDATE:
          return Object.assign({}, state, {
              evaluations: state.evaluations.filter((e) => e.id != action.evalId)
          });
      case actionTypes.RECEIVE:
          return Object.assign({}, state, {
              isDeleting: false
          });
      case actionTypes.ERROR:
          return Object.assign({}, state, {
              isDeleting: false,
              evaluations: state.evaluations.concat(action.evaluation)
          });
      default:
          return state;
    }
}

const fetchEvaluationSaveLogReducer = (state, action) => {
    switch(action.actionType) {
        case actionTypes.FETCH:
            return Object.assign({}, state, {
                isFetchingSaveLog: true
            });
        case actionTypes.RECEIVE:
            return Object.assign({}, state, {
                isFetchingSaveLog: false,
                evaluationSaveLog: action.saves
            });
        case actionTypes.ERROR:
            return Object.assign({}, state, {
                isFetchingSaveLog: false
            });
        default:
            return state;
    }
}

const fetchEvaluationByIdReducer = (state, action) => {
    switch(action.actionType) {
        case actionTypes.FETCH:
            return Object.assign({}, state, {
                isFetchingSingle: true
            });
        case actionTypes.RECEIVE:
            let evaluations = [];
            if(state.evaluations.length === 0){
                evaluations.push(action.evaluation);
            }
            else {
                let found = false;
                evaluations = state.evaluations.reduce((list, e, index) => {
                      const length = state.evaluations.length;
                      if(e.id == action.evaluation.id){
                          list.push(action.evaluation);
                          found = true;
                      }
                      else{
                          list.push(e);
                      }

                      if((length - 1) === index && !found) {
                          list.push(action.evaluation);
                      }
                      return list;

                }, []);
            }
            return Object.assign({}, state, {
                isFetchingSingle: false,
                evaluations
            });
        case actionTypes.ERROR:
            return Object.assign({}, state, {
                isFetchingSingle: false
            });
        default:
            return state;
    }
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_EVALUATIONS:
            return fetchEvaluationsReducer(state, action);
        case CREATE_EVALUATION:
            return createEvaluationReducer(state, action);
        case DOWNLOAD_PDF:
            return downloadPDFReducer(state, action);
        case UPDATE_EVALUATION:
            return updateEvaluationReducer(state, action);
        case UPDATE_SAVE_PROGRESS_TOTAL:
            return Object.assign({}, state, {
                saveProgressTotal: action.saveProgressTotal
            });
        case INCREMENT_SAVE_PROGRESS:
            return Object.assign({}, state, {
                saveProgress: state.saveProgress + 1
            });
        case RESET_SAVE_PROGRESS:
            return Object.assign({}, state, {
                saveProgress: 0,
                saveProgressTotal: 1
            });
        case DELETE_EVALUATION:
            return deleteEvaluationReducer(state, action);
        case CLEAR_EVALUATIONS_CACHE:
            return Object.assign({}, state, {
                evaluations: [],
                hasFetched: false
            });
        case FETCH_EVALUATION_SAVE_LOG:
            return fetchEvaluationSaveLogReducer(state, action);
        case FETCH_EVALUATION_BY_ID:
            return fetchEvaluationByIdReducer(state, action);
        case IMAGE_LOAD_COMPLETE:
            return Object.assign({}, state, {
                evaluations: state.evaluations.map((e) => {
                    if(e.id == action.evalId) {
                        if(action.imageType == 'signature'){
                            e.pdfImages.signature = Object.assign({}, e.pdfImages.signature, {isFetching: false, fileURI: action.fileURI});
                        }
                        else {
                            e.pdfImages[action.imageType] = e.pdfImages[action.imageType].map((image, index) => {
                                if(index == action.index){
                                    return Object.assign({}, image, {
                                        isFetching: false,
                                        fileURI: action.fileURI
                                    })
                                }
                                return image;
                            })
                        }
                    }
                    return e;
                })
            })
        case UPDATE_PDF_URI:
            return Object.assign({}, state, {
                evaluations: state.evaluations.map((evaluation) => {
                    if(action.id == evaluation.id){
                        return Object.assign({}, evaluation, {pdfURI: action.pdfURI});
                    }
                    return evaluation;
                })
            });
        default:
            return state;
    }
};

export default reducer

//sagas

function* fetchEvaluationsSaga(action) {
    if (action.actionType === actionTypes.FETCH) {
        const errorFunc = () => fetchEvaluations(actionTypes.ERROR);
        try {
            console.log('id==================',action.orgId);
            const response = yield call(getEvaluations, action.orgId);
            if (response.error) {
                yield handleError(errorFunc, 'Error Fetching Evaluations: ' + response.message);
            }
            else {
                // response.evaluations.forEach((evaluation) => {
                //     if(evaluation.pdf != null){
                //         UrlToDataURI(evaluation.pdf)
                //         .then((dataURI) => store.dispatch(updatePDFURI(evaluation.id, dataURI)))
                //         .catch((err) => {Materialize.toast('Error Loading PDFs: ' + JSON.stringify(err),10000,'red')});
                //     }
                // })
                yield put(fetchEvaluations(actionTypes.RECEIVE, response));
            }
        }
        catch (e) {
            yield handleError(errorFunc, 'Error Fetching Evaluations: ' + JSON.stringify(e.message == null ? e : e.message));
        }
    }
}

function* fetchEvaluationByIdSaga(action) {
    if(action.actionType === actionTypes.FETCH) {
        const errorFunc = () => fetchEvaluationById(actionTypes.ERROR);
        try {
            const response = yield call(getEvalById, action.evalId);
            // Load the Pictures.
            // I am thinking of putting an IsFetching attribute on each Picture object that I can check on the Evaluation Container.

            if(response.error){
                yield handleError(errorFunc, 'Error Fetching Evaluation: ' + response.message)
            }
            else {
                const {signature, propertyPictures, additionalExhibits} = response.evaluation.pdfImages;
                if(signature != null){
                    response.evaluation.pdfImages.signature = Object.assign({}, signature, {
                        isFetching: true
                    });
                    // let xhr = new XMLHttpRequest();
                    // xhr.onload = function() {
                    //     let reader = new FileReader();
                    //     reader.onloadend = function() {
                    //         store.dispatch(imageLoadComplete(action.evalId, 'signature', reader.result));
                    //         // callback(reader.result);
                    //     }
                    //     reader.readAsDataURL(xhr.response);
                    // };
                    // xhr.open('GET', signature.fileURL);
                    // xhr.responseType = 'blob';
                    // xhr.send();
                    // fetch(`/evaluation/file_proxy?url=${signature.fileURL}`, {
                    //     credentials: 'include',
                    //     method: 'GET'
                    // }).then(response => response.blob())
                    // .then((blob) => {
                    //     let reader = new FileReader();
                    //     reader.onloadend = function(){
                    //         store.dispatch(imageLoadComplete(action.evalId, 'signature', reader.result));
                    //     }
                    //     reader.readAsDataURL(blob);
                    // }).catch(err => {
                    //     Materialize.toast('Error Fetching Evaluation: ' + JSON.stringify(err), 10000);
                    //     store.dispatch(imageLoadComplete(action.evalId, 'signature', null))
                    // });
                    UrlToDataURI(signature.fileURL)
                    .then((dataURI) => {store.dispatch(imageLoadComplete(action.evalId, 'signature', dataURI))})
                    .catch(err => {
                        Materialize.toast('Error Fetching Evaluation: ' + JSON.stringify(err), 10000);
                        store.dispatch(imageLoadComplete(action.evalId, 'signature', null))
                    });
                }
                if(propertyPictures != null && propertyPictures.length > 0){
                    let newPropPics = []
                    for(let i = 0; i < propertyPictures.length; i++){
                        const pic = propertyPictures[i];
                        newPropPics.push(Object.assign({}, pic, {isFetching: true}));
                        // let xhr = new XMLHttpRequest();
                        // xhr.onload = function() {
                        //     let reader = new FileReader();
                        //     reader.onloadend = function() {
                        //         store.dispatch(imageLoadComplete(action.evalId, 'propertyPictures', reader.result, i));
                        //         // callback(reader.result);
                        //     }
                        //     reader.readAsDataURL(xhr.response);
                        // };
                        // xhr.open('GET', pic.fileURL);
                        // xhr.responseType = 'blob';
                        // xhr.send();
                        // fetch(`/evaluation/file_proxy?url=${pic.fileURL}`, {
                        //     credentials: 'include',
                        //     method: 'GET'
                        // }).then(response => response.blob())
                        // .then((blob) => {
                        //     let reader = new FileReader();
                        //     reader.onloadend = function(){
                        //         store.dispatch(imageLoadComplete(action.evalId, 'propertyPictures', reader.result, i));
                        //     }
                        //     reader.readAsDataURL(blob);
                        // }).catch(err => {
                        //     Materialize.toast('Error Fetching Evaluation: ' + JSON.stringify(err), 10000);
                        //     store.dispatch(imageLoadComplete(action.evalId, 'propertyPictures', null, i))
                        // });
                        UrlToDataURI(pic.fileURL)
                        .then(dataURI => {store.dispatch(imageLoadComplete(action.evalId, 'propertyPictures', dataURI, i))})
                        .catch(err => {
                            Materialize.toast('Error Fetching Evaluation: ' + JSON.stringify(err), 10000);
                            store.dispatch(imageLoadComplete(action.evalId, 'propertyPictures', null, i))
                        });
                    }
                    response.evaluation.pdfImages.propertyPictures = newPropPics;
                }
                if(additionalExhibits != null && additionalExhibits.length > 0){
                    let newExhibits = [];
                    for(let i = 0; i < additionalExhibits.length; i++){
                        const pic = additionalExhibits[i];
                        newExhibits.push(Object.assign({}, pic, {isFetching: true}));
                        // let xhr = new XMLHttpRequest();
                        // xhr.onload = function() {
                        //     let reader = new FileReader();
                        //     reader.onloadend = function() {
                        //         store.dispatch(imageLoadComplete(action.evalId, 'additionalExhibits', reader.result, i));
                        //         // callback(reader.result);
                        //     }
                        //     reader.readAsDataURL(xhr.response);
                        // };
                        // xhr.open('GET', pic.fileURL);
                        // xhr.responseType = 'blob';
                        // xhr.send();
                        // fetch(`/evaluation/file_proxy?url=${pic.fileURL}`, {
                        //     credentials: 'include',
                        //     method: 'GET'
                        // }).then(response => response.blob())
                        // .then((blob) => {
                        //     let reader = new FileReader();
                        //     reader.onloadend = function(){
                        //         store.dispatch(imageLoadComplete(action.evalId, 'additionalExhibits', reader.result, i));
                        //     }
                        //     reader.readAsDataURL(blob);
                        // }).catch(err => {
                        //     Materialize.toast('Error Fetching Evaluation: ' + JSON.stringify(err), 10000);
                        //     store.dispatch(imageLoadComplete(action.evalId, 'additionalExhibits', null, i))
                        // });
                        UrlToDataURI(pic.fileURL)
                        .then(dataURI => {store.dispatch(imageLoadComplete(action.evalId, 'additionalExhibits', dataURI, i))})
                        .catch(err => {
                            Materialize.toast('Error Fetching Evaluation: ' + JSON.stringify(err), 10000);
                            store.dispatch(imageLoadComplete(action.evalId, 'additionalExhibits', null, i));
                        })
                    }
                    response.evaluation.pdfImages.additionalExhibits = newExhibits;
                }
                // if(response.evaluation.pdf != null){
                //     UrlToDataURI(response.evaluation.pdf)
                //     .then((dataURI) => store.dispatch(updatePDFURI(response.evaluation.id, dataURI)))
                //     .catch((err) => {Materialize.toast('Error Loading PDFs: ' + JSON.stringify(err),10000,'red')});
                // }
                yield put(fetchEvaluationById(actionTypes.RECEIVE, response));
            }
        }
        catch (e){
            yield handleError(errorFunc, 'Error Fetching Evaluation: ' + JSON.stringify(e.message == null ? e : e.message))
        }
    }
}

function* createEvaluationsSaga(action) {
    if (action.actionType === actionTypes.CREATE) {
        const errorFunc = (message) => () => createEvaluation(actionTypes.ERROR, {message});
        try {
            const {params} = action;
            let updatedParams = {
              ...params,
              pdfImages: {
                propertyPictures: params.pdfImages.propertyPictures.map((pic, index) => {
                  return {...pic, file: {name: pic.file && pic.file.name ? pic.file.name: `propertyPic${index}`}}
                }),
                signature: {...params.pdfImages.signature, file: {name: params.pdfImages.signature.file && params.pdfImages.signature.file.name ? params.pdfImages.signature.file.name : 'signature'}},
                additionalExhibits: params.pdfImages.additionalExhibits.map((pic, index) => {
                  return {...pic, file: {name: pic.file && pic.file.name ? pic.file.name: `additionalExhibit${index}`}}
                })
              }
            }
            console.log('Updated PArams: ', updatedParams);
            const response = yield call(postEvaluation, updatedParams);
            yield put(incrementSaveProgress());
            if (response.error) {
                yield handleError(errorFunc(response.message), 'Error Creating Evaluation: ' + response.message);
            }
            else {
                let pdfURI = null;
                if(params.pdf != null){
                    pdfURI = yield call(downloadPDFInBrowser, params.pdf, params.filename);
                    yield put(incrementSaveProgress());
                }
                yield put(createEvaluation(actionTypes.RECEIVE, Object.assign({}, response, {pdfURI})));
            }
        }
        catch (e) {
            yield handleError(errorFunc(JSON.stringify(e.message == null ? e : e.message)), 'Error Creating Evaluation: ' + JSON.stringify(e.message == null ? e : e.message));
            yield put(resetSaveProgress());
        }
    }
    if (action.actionType === actionTypes.RECEIVE) {
        console.log('Receving creation')
        yield put(push('/evaluations'))
        yield put(resetSaveProgress());
    }

}
const selectEvaluations = (state) => state.evaluation.evaluations;
const selectSaveProgressTotal = (state) =>  state.evaluation.saveProgressTotal;
function* updateEvaluationSaga(action) {
    if (action.actionType === actionTypes.UPDATE) {
        const errorFunc = (message) => () => updateEvaluation(actionTypes.ERROR, {message});
        try {
            // I am sorry for whoever has to read this next. It is quite confusing.
            // I will try to explain myself.
            // I am taking evaluation as stored in the state and transforming it to look like how an Evaluation is stored in the Db.
            // Then I am doing a diff on the store eval and the current state, if a field is different then I add it to updatedValues.
            // This way I am only updating fields that need to be updated rather than updating all fields.
            const saveProgressTotal = yield select(selectSaveProgressTotal);
            if(saveProgressTotal === 1){
              // Download PDF was not called and had no chance to update the progress total.
              yield put(updateSaveProgressTotal(4));
              yield put(incrementSaveProgress());
            }
            const {params} = action;
            const {filename} = params;
            delete params.filename;

            const evaluations = yield select(selectEvaluations);
            const evaluation = evaluations.find((e) => e.id == parseInt(params.evalId));

            // Now I need to split out the state into the proper evaluation format.

            let updatedEval = {};
            Object.keys(params.valuation).forEach((val) => {
                updatedEval[val] = params.valuation[val];
            });

            const propertyRatingFields = ['roadFrontage', 'accessFrontageEasement', 'accessIngressEgressQuality', 'contiguousParcels', 'topography',
                'soils', 'drainage', 'additionalField1', 'additionalField2', 'additionalField3', 'blendedResult', 'totalSubjectScore', 'percentageAboveBelow', 'reconciledOverallRating'];

            const propertyAddressFields = ['propertyAddress', 'propertyCity', 'propertyState', 'propertyPostalCode', 'propertyCountry'];

            const propertyAddressConvert = {
                'propertyAddress': 'address1',
                'propertyCity': 'city',
                'propertyState': 'state',
                'propertyPostalCode': 'postalCode',
                'propertyCountry': 'country'
            };

            const statisticalParametersFields = ['dateOfSaleMin', 'dateOfSaleMax', 'outlierPercentageExclusion', 'acreageMin', 'acreageMax'];

            const parameterFields = Object.keys(params.parameters);
            for (let i = 0; i < parameterFields.length; i++) {
                const field = parameterFields[i];
                const isPropertyRatingField = propertyRatingFields.includes(field);
                const isPropertyAddressField = propertyAddressFields.includes(field);
                const isStatisticalParametersField = statisticalParametersFields.includes(field)
                const value = params.parameters[field];
                if (field != 'marketArea' && !isPropertyRatingField && !isPropertyAddressField && !isStatisticalParametersField) {
                    if (field == 'ownerBorrower') {
                        updatedEval['owner'] = value;
                    }
                    else if (field == 'unTillable') {
                        updatedEval['nonTillable'] = value;
                        if (updatedEval['propertyRating'] == null) {
                            let newPropertyRating = {}
                            newPropertyRating['nonTillable'] = value;
                            updatedEval['propertyRating'] = newPropertyRating;
                        }
                        else {
                            updatedEval['propertyRating']['nonTillable'] = value;
                        }
                    }
                    else {
                        updatedEval[field] = value
                        if (field == 'tillable') {
                            if (updatedEval['propertyRating'] == null) {
                                let newPropertyRating = {}
                                newPropertyRating['tillable'] = value;
                                updatedEval['propertyRating'] = newPropertyRating;
                            }
                            else {
                                updatedEval['propertyRating']['tillable'] = value;
                            }
                        }
                    }
                }

                if (isPropertyRatingField) {
                    if (updatedEval['propertyRating'] == null) {
                        let newPropertyRating = {}
                        newPropertyRating[field] = value;
                        updatedEval['propertyRating'] = newPropertyRating;
                    }
                    else {
                        updatedEval['propertyRating'][field] = value;
                    }
                }

                if (isPropertyAddressField) {
                    const dbField = propertyAddressConvert[field];
                    if (updatedEval['propertyAddress'] == null) {
                        let newPropertyAddress = {};
                        newPropertyAddress[dbField] = value;
                        updatedEval['propertyAddress'] = newPropertyAddress;
                    }
                    else {
                        updatedEval['propertyAddress'][dbField] = value;
                    }
                }

                if (isStatisticalParametersField) {
                    if (updatedEval['statisticalParameters'] == null) {
                        let newStatisticalParameters = {};
                        newStatisticalParameters[field] = value;
                        updatedEval['statisticalParameters'] = newStatisticalParameters;
                    }
                    else {
                        updatedEval['statisticalParameters'][field] = value;
                    }
                }

                if (field == 'marketArea' && value != null) {
                    if (value === 'entireMarketArea') {
                        updatedEval['marketAreaType'] = 'EntireMarketArea';
                    }
                    else if (value.includes('area')) {
                        updatedEval['marketAreaType'] = 'Area';
                        updatedEval['marketArea'] = value;
                    }
                    else if (value.includes('county')) {
                        updatedEval['marketAreaType'] = 'County';
                        updatedEval['marketArea'] = value
                    }
                }

            }

            const propertyRatingParamsState = Object.keys(params.propertyRatingParams);
            for (let i = 0; i < propertyRatingParamsState.length; i++) {
                const field = propertyRatingParamsState[i];
                const value = params.propertyRatingParams[field];
                if (propertyRatingFields.includes(field)) {
                    if (updatedEval['propertyRating'] == null) {
                        let newPropertyRating = {};
                        newPropertyRating[field] = value;
                        updatedEval['propertyRating'] = newPropertyRating;
                    }
                    else {
                        updatedEval['propertyRating'][field] = value;
                    }
                }
            }

            const marketTrendGraphFields = Object.keys(params.marketTrendGraph);
            for (let i = 0; i < marketTrendGraphFields.length; i++) {
                const field = marketTrendGraphFields[i];
                const value = params.marketTrendGraph[field];
                if (field != 'savedScatterData' && field != 'savedTrendData') {
                    if (updatedEval['marketTrendGraph'] == null) {
                        let newMarketTrendGraph = {};
                        newMarketTrendGraph[field] = value;
                        updatedEval['marketTrendGraph'] = newMarketTrendGraph;
                    }
                    else {
                        updatedEval['marketTrendGraph'][field] = value;
                    }
                }
            }
            if(params.pdfURL != null && params.pdfURL != ''){
              updatedEval['pdf'] = params.pdfURL;
            }
            updatedEval['totalDataPointsProperty'] = params.statisticalFilteredLandData.length;
            updatedEval['numPropertiesBeforeCal'] = params.areaFilteredLandData.length;
            if(params.pdfImages != null){
              updatedEval['pdfImages'] = params.pdfImages;
            }
            yield put(incrementSaveProgress());
            // Now do the diff and set values to 'null'
            let updatedValues = {};
            const additionalFields = ['additionalField1', 'additionalField2', 'additionalField3'];
            const evalFields = [...(new Set(Object.keys(evaluation).concat(Object.keys(updatedEval))))].filter((f) => f != 'updatedAt' && f != 'createdAt' && f != 'id' && f != 'orgId' && f != 'ownerBorrower' && f != 'unTillable');
            for (let i = 0; i < evalFields.length; i++) {
                const field = evalFields[i];
                const oldValue = evaluation[field];
                const newValue = updatedEval[field];
                // So Basically is the one of teh value is a dictionary.
                if (field != 'marketArea' && field != 'pdfImages' && field != 'improvements' && (((typeof oldValue === 'object') && oldValue && !(oldValue instanceof moment) && !(oldValue instanceof Array)) ||
                    ((typeof newValue === 'object') && newValue && !(newValue instanceof moment) && !(newValue instanceof Array)))) {
                    const objFields = [...(new Set(Object.keys(oldValue).concat(Object.keys(newValue))))].filter((f) => f != 'id' && f != 'updatedAt' && f != 'createdAt');
                    for (let k = 0; k < objFields.length; k++) {
                        const subField = objFields[k];
                        const subOldValue = oldValue[subField];
                        const subNewValue = newValue[subField];
                        const isAdditionalField = additionalFields.includes(subField);
                        if (!(subField == 'scatterData' && !isAdditionalField && (subNewValue == '' || subNewValue == null)) && !(subField == 'trendData' && (subNewValue == '' || subNewValue == null))) {
                            if ((typeof subOldValue == 'object' && subOldValue instanceof Array) || (typeof subNewValue == 'object' && subNewValue instanceof Array)) {
                                if ((subNewValue == null || subNewValue == '') && (subOldValue != null && subOldValue != '')) {
                                    if (updatedValues[field] == null) {
                                        updatedValues[field] = {};
                                    }
                                    updatedValues[field][subField] = 'null';
                                }
                                else if (subOldValue == null || subOldValue == '') {
                                    if (updatedValues[field] == null) {
                                        updatedValues[field] = {};
                                    }
                                    updatedValues[field][subField] = subNewValue;
                                }
                                else if (subOldValue.length != subNewValue.length) {
                                    if (updatedValues[field] == null) {
                                        updatedValues[field] = {};
                                    }
                                    updatedValues[field][subField] = subNewValue;
                                }
                            }
                            else if (typeof subNewValue === 'object' && subNewValue instanceof moment) {
                                if ((subOldValue == '' || subOldValue == null)) {
                                    if (subNewValue != null && subNewValue != '') {
                                        if (updatedValues[field] == null) {
                                            updatedValues[field] = {};
                                        }
                                        updatedValues[field][subField] = subNewValue;
                                    }
                                }
                                else if (moment(subOldValue) != subNewValue) {
                                    if (updatedValues[field] == null) {
                                        updatedValues[field] = {};
                                    }
                                    updatedValues[field][subField] = subNewValue == null || subNewValue == '' ? 'null' : subNewValue;
                                }
                            }
                            else {
                                if (subOldValue != subNewValue) {
                                    if (!((subOldValue == '' || subOldValue == null ) && (subNewValue == null || subNewValue == ''))) {
                                        // Basically, if the old value was null and the new value is null. No reason to update.
                                        if (updatedValues[field] == null) {
                                            updatedValues[field] = {};
                                        }
                                        updatedValues[field][subField] = subNewValue == '' || subNewValue == null ? 'null' : subNewValue;
                                    }
                                }
                            }
                        }
                        else if (isAdditionalField) {
                            // Special Case for Additional Property Rating Fields
                            if(subOldValue == null){
                                updatedValues[field][subField] = subNewValue;
                            }
                            else {
                                // If one field in an Additional Property Rating field has changed then you need to update the whole field.
                                const additionalFieldNames = Object.keys(subOldValue).concat(Object.keys(subNewValue));
                                console.log('Old Value: ', subOldValue);
                                console.log('New Value: ', subNewValue);
                                const shouldUpdateField = additionalFieldNames.reduce((bool, f) => {
                                    if(subOldValue[f] != subNewValue[f]){
                                        return true;
                                    }
                                    return bool;
                                }, false);
                                if(shouldUpdateField){
                                    updatedValues[field][subField] = subNewValue
                                }
                            }
                        }
                    }
                }
                else if (typeof newValue === 'object' && newValue instanceof moment) {
                    // I need to make sure that the old value gets converted into a moment.
                    if ((oldValue == '' || oldValue == null)) {
                        if (newValue != null && newValue != '') {
                            updatedValues[field] = newValue;
                        }
                    }
                    else if (!moment(oldValue).isSame(newValue)) {
                        updatedValues[field] = newValue == null || newValue == '' ? 'null' : newValue;
                    }
                }
                else if (field == 'marketArea') { 
                    // This deserves a special case because they way I return the market Area if county orea is an object
                    // where as it is stored in different fields if Area or County
                    if ((oldValue == '' || oldValue == null) && (newValue != null && newValue != '')) {
                        // Old Value is null but new is not.
                        // Change from Entire MArket ARea to area or county.

                        if (newValue.includes('area')) {
                            updatedValues['marketAreaId'] = parseInt(newValue.split('-')[1])
                        }
                        else {
                            updatedValues['marketAreaCountyId'] = parseInt(newValue.split('-')[1])
                        }
                    }
                    else if (newValue == '' || newValue == null) {
                        // Changed Market Area to Entire Market Area.
                        if (evaluation['marketAreaType'] == 'Area') {
                            updatedValues['marketAreaId'] = 'null';
                        }
                        else {
                            updatedValues['marketAreaCountyId'] = 'null';
                        }
                    }
                    else if ((newValue != null && newValue != '') && (oldValue != '' && oldValue != null)) {
                        // Both new and old are an area or county.
                        const newValueSplit = newValue.split('-');
                        const newValueType = newValueSplit[0].toLowerCase();
                        const newValueId = parseInt(newValueSplit[1]);
                        const oldValueType = evaluation['marketAreaType'].toLowerCase();
                        const oldValueId = oldValue.id;
                        if (oldValueType != newValueType) {
                            // Changed from Area to County or vice versa.
                            if (oldValueType == 'area') {
                                updatedValues['marketAreaId'] = 'null';
                                updatedValues['marketAreaCountyId'] = newValueId;
                            }
                            else {
                                updatedValues['marketAreaCountyId'] = 'null';
                                updatedValues['marketAreaId'] = newValueId;
                            }
                        }
                        else {
                            // type is the same but maybe id is different.
                            if (oldValueId != newValueId) {
                                if (newValueType == 'area') {
                                    updatedValues['marketAreaId'] = newValueId;
                                }
                                else {
                                    updatedValues['marketAreaCountyId'] = newValueId;
                                }
                            }
                        }
                    }
                }
                else if (field === 'pdfImages') {
                    if (oldValue == null && newValue != null) {
                        updatedValues[field] = newValue
                    }
                    else if (newValue != null) {
                        let pdfImages = {
                            propertyPictures: newValue.propertyPictures.map((pp, index) => {
                                if (pp.updated && pp.fileURI == null) {
                                    return 'null';
                                }
                                return {...pp, file: {name: pp.file && pp.file.name ? pp.file.name : `propertyPicture${index}`}};
                            }),
                            signature: newValue.signature == null || (newValue.signature.updated && newValue.signature.fileURI == null) ? 'null' : 
                            {...newValue.signature, file: {name: newValue.signature.file && newValue.signature.file.name ? newValue.signature.file.name : 'signaturePic'}},
                            additionalExhibits: newValue.additionalExhibits.map((ae, index) => {
                                if (ae.updated && ae.fileURI == null) {
                                    return 'null';
                                }
                                let newAe = {...ae, file: {name: ae.file && ae.file.name ? ae.file.name : `additionalExhibits${index}`}};
                                return newAe;
                            })
                        };
                        updatedValues[field] = pdfImages;
                    }
                }
                else if (field === 'improvements'){
                    if(oldValue == null && newValue != null){
                      updatedValues[field] = newValue;
                    }
                    else if (newValue != null && newValue.updated){
                        updatedValues[field] = newValue;
                    }
                }
                else {
                    // Top Level Value.
                    if (!((oldValue == null || oldValue == '') && (newValue == null || newValue == ''))) {
                        // If both the old value and new value are null, no need to compare. In fact the below if may return true since I changed many values from null to ''
                        if (oldValue != newValue) {
                            updatedValues[field] = newValue == null || newValue == '' ? 'null' : newValue;
                        }
                    }
                }
            }
            //Okay now to send the new data off to the Backend.
            console.log('Updated Values: ', updatedValues);
            yield put(incrementSaveProgress());
            const response = yield call(putEvaluation, parseInt(params.evalId), updatedValues);
            yield put(incrementSaveProgress());
            if (response.error) {
                yield handleError(errorFunc(response.message), 'Error Updating Evaluation: ' + response.message);
            }
            else {
                // Download PDF
                let pdfURI = null;
                if(params.pdfURL != null){
                    pdfURI = yield call(downloadPDFInBrowser, params.pdfURL, filename);

                    yield put(incrementSaveProgress());
                }
                yield put(updateEvaluation(actionTypes.RECEIVE, Object.assign({}, response, {evalId: parseInt(params.evalId), pdfURI})))
            }
        }
        catch (e) {
            let message = JSON.stringify(e.message == null ? e : e.message);
            yield handleError(errorFunc(message), 'Error Updating Evaluation ' + message)
            yield put(resetSaveProgress());
        }
    }
    if (action.actionType === actionTypes.RECEIVE) {
        Materialize.toast('Evaluation has been saved!', 6000);
        yield put(push('/evaluations'))
        yield put(resetSaveProgress());
    }
}


function* downloadPDFSaga(action) {
    console.log('dddddddddddddddddddddddddddddddddddddddddddddddddddddddd');
    console.log('actuib-------------',action.actionType);
    const errorFunc = () => downloadPDF(actionTypes.ERROR);
    if (action.actionType === actionTypes.FETCH) {
        try {
            console.log('rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr');
            // I need to save photos on s3.
            const {saveEval, params, evalId, filename, existingEval} = action;
            // I need to calculate how long the save is going to take.
            let saveProgressTotal = 1; // First step is to figure out how long.


            const {pdfImages} = params;
            for (let i = 0; i < pdfImages.propertyPictures.length; i++) {
              const pic = pdfImages.propertyPictures[i];
              if (pic.file != null && (pic.updated == null || pic.updated)) {
                saveProgressTotal++;
              }
            }
            if (pdfImages.signature.file != null && (pdfImages.signature.updated == null || pdfImages.signature.updated)){
              saveProgressTotal++;
            }
            for (let i = 0; i < pdfImages.additionalExhibits.length; i++) {
              const pic = pdfImages.additionalExhibits[i];
              if (pic.file != null && (pic.updated == null || pic.updated) && (pic.s3Image == null || pic.s3Image == '')) {
                saveProgressTotal++;
              }
              if(pic.file != null){
                saveProgressTotal++; // For the PDF the pages
              }
            }

            saveProgressTotal += 13; // All the pdf pages besides  additional exhibits pages.
            saveProgressTotal += 1; // Download the PDF.

            if(saveEval){
              saveProgressTotal += 1; // save the eval.
            }
            if(existingEval){
              saveProgressTotal += 3; // Reformat the eval state, diff between state and save eval, and save the eval.
            }

            yield put(updateSaveProgressTotal(saveProgressTotal));
            yield put(incrementSaveProgress());

            // Should run a diff on this for when I handle editing Evals.
            let propertyPictures = [];
            let signature = null;
            let additionalExhibits = [];

            for (let i = 0; i < pdfImages.propertyPictures.length; i++) {
                const pic = pdfImages.propertyPictures[i];
                if (pic.file != null && (pic.updated == null || pic.updated)) { // pic updated is true (existing) or null
                    // const picResp = yield call(postPicture, pic.file, pic.file.name);
                    // if (picResp.error) {
                    //     yield handleError(errorFunc, 'Error Uploading Pictures: ', picResp.message);
                    //     return;
                    // }
                    propertyPictures.push({fileURI: pic.fileURI, updated: true, file: {name: pic.file.name}});
                    yield put(incrementSaveProgress());
                }
                else if (pic.file == null && pic.updated) {
                    // You deleted the photo and didnt replace it.
                    propertyPictures.push({updated: true});
                }
                else if (pic.file != null && pic.updated === false) {
                    // Picture didn't update but still needs to be passed into the pdf.
                    propertyPictures.push({
                        fileURI: pic.fileURI == null ? pic.file : pic.fileURI,
                        updated: false,
                        file: {name: pic.file.name}
                    });
                }
            }

            if (pdfImages.signature.file != null) {
                const sigPic = pdfImages.signature.file;
                if (pdfImages.signature.updated == null || pdfImages.signature.updated) {
                    // const sigResp = yield call(postPicture, sigPic, sigPic.name);
                    // if (sigResp.error) {
                    //     yield handleError(errorFunc, 'Error Uploading Pictures: ', sigResp.message);
                    //     return;
                    // }
                    signature = { fileURI: pdfImages.signature.fileURI, updated: true, file: {name: pdfImages.signature.file.name}};
                    yield put(incrementSaveProgress());
                }
                else {
                    signature = {
                        fileURI: pdfImages.signature.fileURI,
                        updated: false,
                        file: {name: pdfImages.signature.file.name}
                    };
                }
            }
            else if (pdfImages.signature.file == null && pdfImages.signature.updated) {
                // Deleted photo.
                signature = {updated: true}
            }

            for (let i = 0; i < pdfImages.additionalExhibits.length; i++) {
                const pic = pdfImages.additionalExhibits[i];
                if (pic.file != null && (pic.updated == null || pic.updated) && (pic.s3Image == null || pic.s3Image == '')) {
                    // const picResp = yield call(postPicture, pic.file, pic.file.name);
                    // if (picResp.error) {
                    //     yield handleError(errorFunc, 'Error Uploading Pictures: ', picResp.message);
                    //     return;
                    // }
                    additionalExhibits.push({updated: true, pageName: pic.pageName, fileURI: pic.fileURI, file: {name: pic.file.name}});
                    yield put(incrementSaveProgress());
                }
                else if (pic.file == null && pic.updated) {
                    additionalExhibits.push({updated: true});
                }
                else if (pic.file != null && pic.updated === false) {
                    // pass in existing object.
                    additionalExhibits.push({
                        pageName: pic.pageName,
                        fileURI: pic.fileURI,
                        updated: false,
                        file: {name: pic.file.name}
                    })
                }
                else if (pic.file != null && pic.updated) {
                    // If the Page Name changed but the picture didn't
                    additionalExhibits.push({
                        pageName: pic.pageName,
                        fileURI: pic.fileURI,
                        file: {name: pic.file.name},
                        updated: true
                    })
                }
            }
console.log('cccccccccccccccccccccccccccccccccccccccccccccccccccccccccc');
            const pdf = generatePDF(Object.assign({}, params, {
                s3Images: {
                    propertyPictures,
                    signature,
                    additionalExhibits
                }
            }), filename, saveEval, existingEval, () => store.dispatch(incrementSaveProgress()), function (payload) {
                store.dispatch(downloadPDF(actionTypes.RECEIVE, payload));
            });
        }
        catch (e) {
            console.log('ddddddddaaaaaaaaaaaaaaaaaaaaaaaaddddddddddddddddrrrrrrrrrrrrrrdddddddddddd');       
            yield handleError(errorFunc, 'Error Downloading PDF: ' + JSON.stringify(e.message == null ? e : e.message));
            yield put(incrementSaveProgress());
        }
    }
    console.log('dddddddddddddddddddddddddddddddddddddddddddrrrrrrrrrrrrrrdddddddddddd');       

    if (action.actionType === actionTypes.RECEIVE) {
        const {saveEval, params, filename, pdfCreation, pdf, existingEval} = action;
        console.log('aaaaaaaaaaaaaaaarrrrrrrrrrrrrdddddddddddd');       

        if (pdfCreation) {
            const resp = yield call(postPDF, pdf, filename + '.pdf');
            const pdfURL = resp['file'];
            console.log('bbbbbbbbbbbbbbbbbbbbrrrrrrrrrrrrrrdddddddddddd');       

            // const a = window.document.createElement('a');
            // a.href = pdfURL;
            // a.download = filename + '.pdf';

            // Append anchor to body.
            // document.body.appendChild(a);
            // a.click();

            // Remove anchor from body
            // document.body.removeChild(a);
            // yield put(incrementSaveProgress());

            if (saveEval) {
                yield put(createEvaluation(actionTypes.CREATE, {params: Object.assign({}, params, {pdf: pdfURL, filename})}))
            }
            if (existingEval) {
                yield put(updateEvaluation(actionTypes.UPDATE, {params: Object.assign({}, params, {pdfURL, filename})}))
            }

            yield put(downloadPDF(actionTypes.RECEIVE))
        }
    }
}

const downloadPDFInBrowser = async (pdfURL, filename) => {
    // const dataURI =  await UrlToDataURI(pdfURL);
    const a = window.document.createElement('a');
    a.href = pdfURL;
    a.download = filename + '.pdf';

    // Apend anchor to body
    document.body.appendChild(a);
    a.click();

    // Remove anchor from body
    document.body.removeChild(a);
    return pdfURL;
}

function* deleteEvaluationSaga (action) {
    if(action.actionType === actionTypes.FETCH){
        let {evalId} = action;
        evalId = parseInt(evalId);
        const evaluations = yield select(selectEvaluations);
        const evaluation = evaluations.find((e) => e.id === evalId);
        const errorFunc = () => deleteEvaluation(actionTypes.ERROR, {evaluation});
        try {
          yield put(push('/evaluations'))
          yield put(deleteEvaluation(actionTypes.UPDATE, {evalId}));
          const response = yield call(deleteEvaluationAPI, evalId);
          console.log('Returned from API.');
          if(response.error){
              yield handleError(errorFunc, 'Error Delete Evaluation: ' + response.message);
          }
          else {
              yield put(deleteEvaluation(actionTypes.RECEIVE));
              Materialize.toast('Evaluation Deleted!', 6000);
          }
        }
        catch (e) {
            yield handleError(errorFunc, 'Error Deleting Evaluation: ' + JSON.stringify(e.message == null ? e : e.message));
        }
    }
}

function* fetchEvaluationSaveLogSaga (action) {
    if(action.actionType === actionTypes.FETCH) {
        const errorFunc = () => fetchEvaluationSaveLog(actionTypes.ERROR);
        try {
            const {orgId} = action;
            const response = yield call(fetchEvaluationSaveLogAPI, orgId);
            if(response.error){
                yield handleError(errorFunc, 'Error Fetching Evaluation Save Log: ' + response.message);
            }
            else{
                yield put(fetchEvaluationSaveLog(actionTypes.RECEIVE, response));
            }
        }
        catch(e) {
            yield handleError(errorFunc, 'Error Fetching Evaluation Save Log: ' + JSON.stringify(e.message == null ? e : e.message))
        }
    }
}

export function* evaluationSaga() {
    yield takeEvery(FETCH_EVALUATIONS, fetchEvaluationsSaga);
    yield takeEvery(DOWNLOAD_PDF, downloadPDFSaga);
    yield takeEvery(CREATE_EVALUATION, createEvaluationsSaga);
    yield takeEvery(UPDATE_EVALUATION, updateEvaluationSaga);
    yield takeEvery(DELETE_EVALUATION, deleteEvaluationSaga);
    yield takeLatest(FETCH_EVALUATION_SAVE_LOG, fetchEvaluationSaveLogSaga);
    yield takeEvery(FETCH_EVALUATION_BY_ID, fetchEvaluationByIdSaga)
}
