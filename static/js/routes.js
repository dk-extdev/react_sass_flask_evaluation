/**
 * Created by rayde on 11/1/2017.
 */
import React from 'react'
import {Route, IndexRoute, Redirect} from 'react-router'
import App from './containers/App'
import OrganizationList from './containers/OrganizationList'
import OrganizationForm from './containers/OrganizationForm'
import OrganizationContainer from './containers/OrganizationContainer'
import DataImport from './containers/DataImport'
import Users from './containers/Users'
import Evaluations from './containers/Evaluations'
import NewEvaluationContainer from './containers/NewEvaluationContainer'
import EvaluationContainer from './containers/EvaluationContainer'
import PDFTestView from './containers/PDFTestView'
import Settings from './containers/Settings'
import EvaluationSaveLogContainer from './containers/EvaluationSaveLogContainer'

export default (
    <Route exact path="/" component={App}>
        <Route path="organizations" component={OrganizationList}/>
        <Route path="organizations/new" component={OrganizationForm}/>
        <Route path="organizations/:orgId" component={OrganizationContainer}/>
        <Route path="data/imports" component={DataImport}/>
        <IndexRoute component={Evaluations}/>
        <Route path="evaluations" component={Evaluations}/>
        <Route path="evaluations/new" component={NewEvaluationContainer}/>
        <Route path="evaluations/:evalId" component={EvaluationContainer}/>
        <Route path="users" component={Users}/>
        <Route path="pdfTest" component={PDFTestView}/>
        <Route path="settings" component={Settings}/>
        <Route path="organizations/:orgId/evaluations/:evalId" component={EvaluationContainer}/>
        <Route path="organizations/:orgId/evaluationLogs" component={EvaluationSaveLogContainer}/>
    </Route>
);
