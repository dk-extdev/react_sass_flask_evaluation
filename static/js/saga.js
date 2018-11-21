/**
 * Created by rayde on 11/1/2017.
 */
import {userSaga} from './ducks/user'
import {orgSaga} from './ducks/organization'
import {landDataSaga} from './ducks/landData'
import {evaluationSaga} from './ducks/evaluation'

export default function* rootSaga(){
    yield [
        userSaga(),
        orgSaga(),
        landDataSaga(),
        evaluationSaga()
    ];
}