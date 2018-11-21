/**
 * Created by rayde on 11/14/2017.
 */
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {fetchOrgUsers, fetchUserInvites, fetchOrgs, fetchAllCounties, addAreas, createUserInvite, deleteUserInvite, editOrg, deleteArea,
  disableEnableUser} from '../ducks/organization'
import {fetchEvaluations, clearEvaluationsCache, fetchEvaluationSaveLog} from '../ducks/evaluation'
import * as actionTypes from '../ducks/constants'
import Spinner from '../components/Spinner'
import OrganizationFormComponent from '../components/OrganizationFormComponent'
import SuperSelectField from 'material-ui-superselectfield'
import AreaTab from '../components/AreaTab'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import {Input} from 'react-materialize'
import StatsTab from '../components/StatsTab'
import OrganizationEvalTab from '../components/OrganizationEvalTab'
import {push} from 'react-router-redux'
import {Tabs, Tab} from 'react-materialize'

const mapStateToProps = (state, ownProps) => {
    return {
        orgId: ownProps.params.orgId,
        isFetchingUserInvites: state.organization.isFetchingUserInvites,
        userInvites: state.organization.userInvites,
        isFetchingOrgUsers: state.organization.isFetchingOrgUsers,
        orgUsers: state.organization.orgUsers,
        organizations: state.organization.organizations,
        isFetchingOrgs: state.organization.isFetching,
        hasFetchedOrgs: state.organization.hasFetched,
        isFetchingAllCounties: state.organization.isFetchingCounties,
        allCounties: state.organization.counties,
        isCreatingAreas: state.organization.isCreatingAreas,
        isSendingUserInvite: state.organization.isSendingUserInvite,
        isUpdatingOrg: state.organization.isUpdatingOrg,
        location: ownProps.location.pathname,
        evaluations: state.evaluation.evaluations,
        isFetchingEvaluations: state.evaluation.isFetching,
        isFetchingSaveLog: state.evaluation.isFetchingSaveLog,
        evaluationSaveLog: state.evaluation.evaluationSaveLog
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        getUsers: (orgId) => {
            dispatch(fetchOrgUsers(actionTypes.FETCH, {orgId}));
        },
        getUserInvites: (orgId) => {
            dispatch(fetchUserInvites(actionTypes.FETCH, {orgId}));
        },
        getOrgs: () => {
            dispatch(fetchOrgs(actionTypes.FETCH));
        },
        getCounties: () => {
            dispatch(fetchAllCounties(actionTypes.FETCH))
        },
        addAreas: (orgId, counties, areas) => {
            dispatch(addAreas(actionTypes.CREATE, {orgId, counties, areas}));
        },
        sendUserInvite: (userInvite, existing, id) => {
            let params = {userInvite, existing};
            if(existing){
                params['id'] = id;
            }
            else {
                params['tempId'] = id;
            }
            dispatch(createUserInvite(actionTypes.CREATE, params));
        },
        deleteUserInvite: (inviteId) => {
            dispatch(deleteUserInvite(actionTypes.UPDATE, {inviteId}));
        },
        updateOrg: (orgId, params) => {
            dispatch(editOrg(actionTypes.UPDATE, {orgId, params}));
        },
        deleteArea: (orgId, areaId) => {
            dispatch(deleteArea(actionTypes.FETCH, {orgId, areaId}));
        },
        toggleUserStatus: (userId) => {
            dispatch(disableEnableUser(actionTypes.UPDATE, {userId}));
        },
        getEvaluations: (orgId) => {
            dispatch(fetchEvaluations(actionTypes.FETCH, {orgId}));
        },
        goToEval: (evalId, orgId) => {
            dispatch(push(`/organizations/${orgId}/evaluations/${evalId}`))
        },
        clearEvalStore: () => {
            dispatch(clearEvaluationsCache());
        },
        getEvaluationSaveLog: (orgId) => {
            dispatch(fetchEvaluationSaveLog(actionTypes.FETCH, {orgId}));
        },
        goToSaveLog: (orgId) => {
            dispatch(push(`/organizations/${orgId}/evaluationLogs`));
        }
    }
};

const replaceTabUrl = (tabName) => {
    const url = window.location.pathname;
    window.history.replaceState(null, '', url + '#' + tabName);
}

class OrganizationContainer extends Component {
    constructor(props) {
        super(props);
        const {organizations, orgId} = this.props;
        const org = organizations.find((o) => o.id === parseInt(orgId));
        this.state = {
            name: org == null ? '' : org.name,
            address: org == null ? {address1: '', address2: '', city: '', state: '', country: 'USA', postalCode: ''} :
                org.address.address2 == null ? Object.assign({}, org.address, {address2: ''}) : org.address,
            newUserInvite: {
                name: '',
                role: 'OrgUser',
                email: ''
            },
            farmableFactor: org == null || org.farmableFactor == null ? '' : org.farmableFactor,
            nonfarmableFactor: org == null || org.nonfarmableFactor == null ? '': org.nonfarmableFactor,
            irrigationFactor: org == null || org.irrigationFactor == null ? '': org.irrigationFactor
        };
        this.handleOrgFormChange = this.handleOrgFormChange.bind(this);
        this.renderSpinner = this.renderSpinner.bind(this);
        this.renderUsers = this.renderUsers.bind(this);
        this.renderUserInvites = this.renderUserInvites.bind(this);
        this.renderUserTable = this.renderUserTable.bind(this);
        this.saveAreas = this.saveAreas.bind(this);
        this.renderNewUserInvite = this.renderNewUserInvite.bind(this);
        this.onClickNewUserInvite = this.onClickNewUserInvite.bind(this);
        this.onClickDeleteUserInvite = this.onClickDeleteUserInvite.bind(this);
        this.updateOrg = this.updateOrg.bind(this);
    }

    componentDidUpdate(prevProps) {
        const {isFetchingOrgs, orgId, organizations, userInvites} = this.props;
        if (isFetchingOrgs === false && prevProps.isFetchingOrgs === true) {
            const org = organizations.find((o) => o.id === parseInt(orgId));
            this.setState({
                name: org.name,
                address: org.address.address2 == null ? Object.assign({}, org.address, {address2: ''}) : org.address,
                farmableFactor: org.farmableFactor == null ? '' : org.farmableFactor,
                nonfarmableFactor: org.nonfarmableFactor == null ? '' : org.nonfarmableFactor,
                irrigationFactor: org.irrigationFactor == null ? '': org.irrigationFactor
            });
        }
        if(userInvites.length > prevProps.userInvites.length){
          // You just sent one
          $('.tooltipped').tooltip({delay: 50});
        }
        $('ul.tabs').tabs();
    }

    componentDidMount() {
        const {orgId, getUsers, getUserInvites, isFetchingOrgs, hasFetchedOrgs, getOrgs, isFetchingAllCounties,
            allCounties, getCounties, getEvaluations, getEvaluationSaveLog} = this.props;
        if (!isFetchingOrgs && !hasFetchedOrgs) {
            getOrgs();
        }
        if (!isFetchingAllCounties && allCounties.length == 0) {
            getCounties();
        }
        getUsers(orgId);
        getUserInvites(orgId);
        getEvaluations(orgId);
        getEvaluationSaveLog(orgId);
        $('.tooltipped').tooltip({delay: 50});
        $('ul.tabs').tabs();
    }

    componentWillUnmount() {
        $('.tooltipped').tooltip('remove');
        this.props.clearEvalStore();
    }

    handleOrgFormChange(attributeName) {
        if (attributeName === 'state') {
            return (state) => {
                this.setState({
                    address: Object.assign({}, this.state.address, {state})
                });
            }
        }
        if(['address1', 'address2', 'city', 'postalCode'].find((attr) => attr === attributeName)){
          return (event) => {
              let newAttr = {};
              newAttr[attributeName] = event.target.value;
              this.setState({
                  address: Object.assign({}, this.state.address, newAttr)
              });
          };
        }
        return (event) => {
            let newAttr = {};
            newAttr[attributeName] = event.target.value;
            this.setState(newAttr);
        }
    }

    renderSpinner() {
        const {  isFetchingOrgs, isSendingUserInvite, isUpdatingOrg} = this.props;
        if (isFetchingOrgs || isSendingUserInvite || isUpdatingOrg) {
            return (
                <div className="overlay-spinner valign-wrapper">
                    <div className="row valign">
                        <div className="center">
                            <Spinner />
                        </div>
                    </div>
                </div>
            );
        }
    }

    renderUsers() {
        const {isFetchingOrgUsers, orgUsers, toggleUserStatus} = this.props;
        if (!isFetchingOrgUsers) {
            return orgUsers.map((user) => {
                return (
                    <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.roles[0].name}</td>
                        <td>{user.disabled ? <span className="red-text">disabled</span> : <span className="green-text">active</span>}</td>
                        <td>
                          {user.disabled ?
                            <button className="btn-floating green waves-effect waves-light tooltipped" disabled={user.isUpdating != null && user.isUpdating}
                            data-delay="50" data-position="top"
                            data-tooltip="Enable this user." onClick={() => toggleUserStatus(user.id)}>
                              <i className="material-icons">lock_open</i>
                            </button>
                            :
                             <button className="btn-floating amber waves-effect waves-light tooltipped"
                             disabled={(user.isUpdating != null && user.isUpdating) || user.roles.reduce((bool, role) => {
                               if(role.name == 'AppAdmin' || role.name == 'RootAdmin'){
                                   return true;
                               }
                               return bool;
                             }, false)}
                              data-delay="50" data-position="top"
                              data-tooltip="Disable this user." onClick={() => toggleUserStatus(user.id)} >
                                <i className="material-icons">lock</i>
                              </button>}

                        </td>
                        <td>
                            <button className="btn-floating blue waves-effect waves-light tooltipped" ata-delay="50" data-position="top"
                                    data-tooltip="Edit this user."
                                    disabled={(user.isUpdating != null && user.isUpdating) || true}>
                                <i className="material-icons">edit</i>
                            </button>
                        </td>
                        <td>
                            <button className="btn-floating red waves-effect waves-light tooltipped" data-delay="50" data-position="top"
                                    data-tooltip="Delete this user."
                                    disabled={(user.isUpdating != null && user.isUpdating) || true}>
                                <i className="material-icons">delete</i>
                            </button>
                        </td>
                    </tr>
                );
            })

        }
    }

    onClickDeleteUserInvite(inviteId){
      return () => {
        this.props.deleteUserInvite(inviteId);
      }
    }

    renderUserInvites() {
        const {isFetchingUserInvites, userInvites , isFetchingOrgUsers, orgUsers} = this.props;
        if (!isFetchingOrgUsers && !isFetchingUserInvites) {
            return userInvites.reduce((list, invite) => {
                if (!orgUsers.find((u) => u.email === invite.email)) {
                    list.push(<tr key={invite.id}>
                        <td>
                            {invite.name}
                        </td>
                        <td>
                            {invite.email}
                        </td>
                        <td>
                            {invite.role.name}
                        </td>
                        <td><span className="grey-text">Invite Sent</span></td>
                        <td></td>
                        <td>
                            <button className="btn-floating waves-effect waves-light green tooltipped" data-delay="50" data-position="top"
                                    data-tooltip="Resend User Invite"
                                    disabled={invite.isSending != null && invite.isSending}>
                                <i className="material-icons">email</i>
                            </button>
                        </td>
                        <td>
                            <button
                                className="btn-floating waves-effect waves-light red tooltipped" data-delay="50" data-position="top"
                                data-tooltip="Delete User Invite"
                                disabled={invite.isSending != null && invite.isSending} onClick={this.onClickDeleteUserInvite(invite.id)}>
                                <i className="material-icons">delete</i>
                            </button>
                        </td>
                    </tr>)
                }
                return list;
            }, [])
        }
    }

    onClickNewUserInvite(){
        const {sendUserInvite, orgId, orgUsers, userInvites} = this.props;
        const {newUserInvite} = this.state;

        if(newUserInvite.name === '' || newUserInvite.email === "" || newUserInvite.role === ''){
            Materialize.toast('In order to send a User Invite, you need to fill out all of the fields.', 6000, 'red');
            return;
        }

        sendUserInvite(Object.assign({}, newUserInvite, {orgId, tempId: 1}), false, 1);
        this.setState({
            newUserInvite: {
                name: '',
                email: '',
                role: 'OrgUser'
            }
        })

    }

    renderNewUserInvite(){
        const {newUserInvite} = this.state;
        return (
            <tr>
                <td><div className="input-field">
                    <input type="text" placeholder="John Doe" value={newUserInvite.name}
                           onChange={(event) => this.setState({newUserInvite: Object.assign({}, newUserInvite, {name: event.target.value})})}/>
                </div></td>
                <td><div className="input-field">
                    <input type="email" placeholder="john.doe@e-valuereport.com" value={newUserInvite.email}
                           onChange={(event) => this.setState({newUserInvite: Object.assign({}, newUserInvite, {email: event.target.value})})}/>
                </div></td>
                <td>
                    <Input type="select" s={12} value={newUserInvite.role}
                           onChange={(event) => this.setState({newUserInvite: Object.assign({}, newUserInvite, {role: event.target.value})})}>
                        <option id="OrgUser" value="OrgUser">User</option>
                        <option id="OrgAdmin" value="OrgAdmin">Org Admin</option>
                    </Input>
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td><button className="btn-floating" onClick={this.onClickNewUserInvite}><i className="material-icons">send</i></button></td>
            </tr>
        );
    }

    renderUserTable() {
        const {isFetchingOrgUsers, isFetchingOrgs} = this.props;
        if (isFetchingOrgUsers && !isFetchingOrgs) {
            return (
                <div className="row valign-wrapper">
                    <div className="valign">
                        <div className="center">
                            <Spinner size=""/>
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <table>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th></th>
                    <th></th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {this.renderUsers()}
                {this.renderUserInvites()}
                {this.renderNewUserInvite()}
                </tbody>
            </table>
        );
    }

    saveAreas(counties, areas) {
        const org = this.props.organizations.find((o) => o.id === parseInt(this.props.orgId));
        const newCounties = counties.reduce((arr, county) => {
            if (org.counties == null || org.counties.find((c) => c.id === county.id) == null) {
                arr.push(county)
            }
            return arr;
        }, []);
        this.props.addAreas(parseInt(this.props.orgId), newCounties, areas);
    }

    updateOrg(){
        // Edit the org right here.
        const {organizations, orgId} = this.props;
        const organization = organizations.find(({id}) => id === parseInt(orgId));
        const {name, address, farmableFactor, nonfarmableFactor, irrigationFactor} = this.state;
        // Perform a diff on props and state
        let payload = {};
        if(organization.name !== name) {
          if(name === ''){
            Materialize.toast('Name is required for an organization', 8000, 'red');
            return;
          }
          else {
            payload['name'] = name;
          }
        }

        if(organization.farmableFactor != farmableFactor && !(organization.farmableFactor == null && farmableFactor === '')){
          if(farmableFactor === ''){
            payload['farmableFactor'] = 'null';
          }
          else {
            payload['farmableFactor'] = parseFloat(farmableFactor);
          }
        }

        if(organization.nonfarmableFactor != nonfarmableFactor && !(organization.nonfarmableFactor == null && nonfarmableFactor === '')){
          if(nonfarmableFactor === ''){
            payload['nonfarmableFactor'] = 'null';
          }
          else {
            payload['nonfarmableFactor'] = parseFloat(nonfarmableFactor);
          }
        }

        if(organization.irrigationFactor != irrigationFactor && !(organization.irrigationFactor == null && irrigationFactor === '')){
          if(irrigationFactor === ''){
            payload['irrigationFactor'] = 'null';
          }
          else {
            payload['irrigationFactor'] = parseFloat(irrigationFactor);
          }
        }

        Object.keys(address).forEach((field) => {
            if(organization.address[field] !== address[field] && !(organization.address[field] == null && address[field] === '')){
                if(field === 'address2') {
                    if(address[field] === '') {
                        if(payload['address'] == null){
                              payload['address'] = {};
                        }
                        payload['address'][field] = 'null'
                    }
                    else {
                        if(payload['address'] == null){
                            payload['address'] = {};
                        }
                        payload['address'][field] = address[field];
                    }
                }
                else {
                    if(address[field] === ''){
                          Materialize.toast(field + ' is a required field', 8000, 'red');
                          return;
                    }
                    else {
                        payload['address'][field] = address[field];
                    }
                }
            }
        });

        this.props.updateOrg(organization.id, payload);
    }

    render() {
        const {organizations, orgId, allCounties, evaluationSaveLog, isFetchingSaveLog} = this.props;
        const org = organizations.find((o) => o.id === parseInt(orgId));
        return (
            <MuiThemeProvider>
                <div>
                    {this.renderSpinner()}
                    <div className="row">
                        <h1 className="text-padding">{org == null ? 'Organization' : org.name}</h1>
                    </div>
                    <div className="row">
                        <div className="divider"></div>
                    </div>
                    <div className="row col s12">
                        <div className="col s12">
                            <ul className="tabs tabs-fixed-width">
                                <li className="tab">
                                    <a onClick={() => replaceTabUrl('details')} href="#details">Details</a>
                                </li>
                                <li className="tab">
                                    <a onClick={() => replaceTabUrl('users')} href="#users">Users</a>
                                </li>
                                <li className="tab">
                                    <a onClick={() => replaceTabUrl('areas')} href="#areas">Areas</a>
                                </li>
                                <li className="tab">
                                    <a onClick={() => replaceTabUrl('evaluations')} href="#evaluations">Evaluations</a>
                                </li>
                                <li className="tab">
                                    <a onClick={() => replaceTabUrl('stats')} href="#stats">Stats</a>
                                </li>

                            </ul>
                        </div>
                        <div id="details" className="col s12">
                            <OrganizationFormComponent name={this.state.name} address={this.state.address}
                                                       handleInputChange={this.handleOrgFormChange} farmableFactor={this.state.farmableFactor}
                                                       nonfarmableFactor={this.state.nonfarmableFactor} irrigationFactor={this.state.irrigationFactor}
                                                       updateOrg={this.updateOrg} location={this.props.location}/>
                        </div>
                        <div id="users" className="col s12">{this.renderUserTable()}</div>
                        <AreaTab org={org} allCounties={allCounties}
                                 counties={org == null || org.counties == null ? [] : org.counties}
                                 areas={org == null || org.areas == null ? [] : org.areas}
                                 isFetchingAllCounties={this.props.isFetchingAllCounties}
                                 isCreatingAreas={this.props.isCreatingAreas} saveAreas={this.saveAreas}
                                 isFetchingOrgs={this.props.isFetchingOrgs} deleteArea={this.props.deleteArea}/>
                        <OrganizationEvalTab orgId={this.props.orgId} goToEval={this.props.goToEval} isFetchingEvaluations={this.props.isFetchingEvaluations} evaluations={this.props.evaluations}/>
                        <StatsTab orgId={this.props.orgId} goToSaveLog={this.props.goToSaveLog}
                        isFetchingEvaluations={this.props.isFetchingEvaluations} evaluations={this.props.evaluations}
                        isFetchingSaveLog={isFetchingSaveLog} evaluationSaveLog={evaluationSaveLog} />

                    </div>
                </div>
            </MuiThemeProvider>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(OrganizationContainer)
