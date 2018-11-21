/**
 * Created by rayde on 12/21/2017.
 */
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {fetchOrgUsers, fetchUserInvites, createUserInvite, deleteUserInvite, disableEnableUser} from '../ducks/organization'
import * as actionTypes from '../ducks/constants'
import Spinner from '../components/Spinner'
import {Input} from 'react-materialize'

const mapStateToProps = (state) => {
    return {
      isFetchingOrgUsers: state.organization.isFetchingOrgUsers,
      orgUsers: state.organization.orgUsers,
      hasFetchedOwnOrgUsers: state.user.hasFetchedOwnOrgUsers,
      organization: state.user.organization,
      hasFetchedOwnUserInvites: state.user.hasFetchedOwnUserInvites,
      isFetchingUserInvites: state.organization.isFetchingUserInvites,
      userInvites: state.organization.userInvites,
      isSendingUserInvite: false
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        getUsers: (orgId) => {
            dispatch(fetchOrgUsers(actionTypes.FETCH, {orgId}))
        },
        getUserInvites: (orgId) => {
            dispatch(fetchUserInvites(actionTypes.FETCH, {orgId}));
        },
        destroyUserInvite: (inviteId) => {
            dispatch(deleteUserInvite(actionTypes.UPDATE, {inviteId}))
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
        toggleUserStatus: (userId) => {
            dispatch(disableEnableUser(actionTypes.UPDATE, {userId}));
        }
    }
};

class Users extends Component {
    constructor(props){
        super(props);
        this.state = {
            newUserInvite: {
                name: '',
                email: '',
                role: 'OrgUser'
            }
        }
        this.renderUsers = this.renderUsers.bind(this);
        this.renderUserInvites = this.renderUserInvites.bind(this);
        this.onClickDeleteUserInvite = this.onClickDeleteUserInvite.bind(this);
        this.onClickNewUserInvite = this.onClickNewUserInvite.bind(this);
        this.renderNewUserInvite = this.renderNewUserInvite.bind(this);
    }
    componentDidMount(){
      $('.tooltipped').tooltip({delay: 50});
      $('.collapsible').collapsible();
      const {isFetchingOrgUsers, hasFetchedOwnOrgUsers, getUsers, organization, getUserInvites,
        hasFetchedOwnUserInvites, isFetchingUserInvites} = this.props;
      if(!isFetchingOrgUsers && !hasFetchedOwnOrgUsers){
          getUsers(organization.id);
      }
      if(!isFetchingUserInvites && !hasFetchedOwnUserInvites){
          getUserInvites(organization.id);
      }
    }
    componentWillUnmount() {
        $('.tooltipped').tooltip('remove');
    }
    componentDidUpdate(prevProps){
      if(prevProps.orgUsers.length !== this.props.orgUsers.length){
        $('.collapsible').collapsible();
      }
      if(this.props.userInvites.length > prevProps.userInvites.length){
        // You just sent one
        $('.tooltipped').tooltip({delay: 50});
      }
    }
    onClickDeleteUserInvite(inviteId){
      return () => {
        this.props.destroyUserInvite(inviteId);
      }
    }
    renderUserInvites(){
        const {orgUsers, userInvites} = this.props;
        return userInvites.reduce((list, invite) => {
            if(!orgUsers.find((user) => user.email === invite.email)){
                
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
                      <td><span className="grey-text">pending</span></td>
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
                return list;
            }
            return list;
        }, [])
    }
    onClickNewUserInvite(){
        const {sendUserInvite, organization, orgUsers, userInvites} = this.props;
        const orgId = organization.id;
        const {newUserInvite} = this.state;

        if(newUserInvite.name === '' || newUserInvite.email === "" || newUserInvite.role === ''){
            Materialize.toast('In order to send a User Invite, you need to fill out all of the fields.', 6000, 'red');
            return;
        }

        sendUserInvite(Object.assign({}, newUserInvite, {orgId, tempId: 1, role: newUserInvite.role == 'Admin' ? 'OrgAdmin' : (newUserInvite.role == 'User' ? 'OrgUser' : newUserInvite.role)}), false, 1);
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
                        <option id="OrgUser">User</option>
                        <option id="OrgAdmin">Admin</option>
                    </Input>
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td><button className="btn-floating" onClick={this.onClickNewUserInvite}><i className="material-icons">send</i></button></td>
            </tr>
        );
    }
    renderUsers(){
        const {orgUsers, isFetchingOrgUsers, isFetchingUserInvites, toggleUserStatus} = this.props;
        if(isFetchingOrgUsers || isFetchingUserInvites){
            return (
              <div className="row">
                  <div className="center">
                      <Spinner />
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
                  {orgUsers.map((user) => {
                        return (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.roles[0].name}</td>
                                <td>{user.disabled ? <span className="red-text">disabled</span> : <span className="green-text">active</span>}</td>
                                <td>
                                  {user.disabled ?
                                  <button className="btn-floating green waves-effect waves-light tooltipped" data-delay="50" data-position="top"
                                    data-tooltip="Enable this user."
                                     disabled={user.isUpdating != null && user.isUpdating} onClick={() => toggleUserStatus(user.id)}>
                                      <i className="material-icons">lock_open</i>
                                  </button> :
                                  <button className="btn-floating amber waves-effect waves-light tooltipped" data-delay="50" data-position="top"
                                    data-tooltip="Disable this user."
                                     disabled={(user.isUpdating != null && user.isUpdating) || (user.roles.reduce((bool, role) => {
                                       if(role.name == 'AppAdmin' || role.name == 'RootAdmin'){
                                           return true;
                                       }
                                       return bool;
                                     }, false))} onClick={() => toggleUserStatus(user.id)}>
                                      <i className="material-icons">lock</i>
                                  </button>
                                }
                                </td>
                                <td>
                                    <button className="btn-floating blue waves-effect waves-light tooltipped" data-delay="50" data-position="top"
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
                  })}
                  {this.renderUserInvites()}
                  {this.renderNewUserInvite()}
              </tbody>
          </table>
        );
    }
    render(){
        const {isFetchingOrgUsers, getOrgUsers, organization} = this.props;
        return (
          <div>
              <div className="fixed-action-btn">
                  <button className="btn-floating btn-large e-value-yellow tooltipped pulse" data-position="left"
                          data-delay="50"
                          data-tooltip="Refresh Users List" onClick={() => getOrgUsers(organization.id)} disabled={isFetchingOrgUsers}>
                      <i className="large material-icons">refresh</i>
                  </button>
              </div>
              <div className="row">
                  <h1 className="e-value-text-green">Users</h1>
              </div>
              <div className="divider">
              </div>
              {this.renderUsers()}
          </div>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Users)
