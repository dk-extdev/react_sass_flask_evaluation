/**
 * Created by rayde on 11/12/2017.
 */
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {push} from 'react-router-redux'
import Header from '../components/Header'
import Spinner from '../components/Spinner'
import {logOut} from '../ducks/user'
import * as actionTypes from '../ducks/constants'

const mapStateToProps = (state, ownProps) => {
    return {
        userId: state.user.id,
        name: state.user.name,
        email: state.user.email,
        organization: state.user.organization,
        roles: state.user.roles,
        isUserFetching: state.user.isFetching,
        hasUserFetched: state.user.hasFetched,
        location: ownProps.location.pathname
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        goToOrgList: () => {
            dispatch(push('/organizations'));
        },
        goToEvals: (isAdmin=null) => {
            if(isAdmin){
              dispatch(push('/evaluations'))
            }
            else {
              dispatch(push('/'))
            }
        },
        goToUsers: () => {
            dispatch(push('/users'))
        },
        goToSettings: () => {
            dispatch(push('/settings'))
        },
        logOut: () => {
            dispatch(logOut(actionTypes.FETCH));
        },
        goToDataImport: () => {
            dispatch(push('/data/imports'))
        }
    }
};

const openSideNav = () => {
    console.log('I am being clicked');
    $('.button-collapse').sideNav('show');
};

class App extends Component {
    constructor(props) {
        super(props);
        this.prepareSideNav = this.prepareSideNav.bind(this);
        // this.openMDialog = this.openMDialog.bind(this);
        // this.openMDialog1 = this.openMDialog1.bind(this);

    }

    componentDidMount() {
        $(".button-collapse").sideNav({
            closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
            draggable: true
        });
        const {hasUserFetched, roles, goToOrgList, location} = this.props;
        if (hasUserFetched && location === '/') {
            const role = roles.find((r) => r.name === 'RootAdmin' || r.name === 'AppAdmin');
            if (role) {
            //    goToOrgList();
            }
        }

    }
 
    componentDidUpdate(prevProps) {
        if (prevProps.isUserFetching === true && this.props.isUserFetching === false) {
            $(".button-collapse").sideNav({
                closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
                draggable: true
            });
            const {hasUserFetched, roles, goToOrgList, location} = this.props;
            if (hasUserFetched && location === '/') {
                console.log('Roles: ', roles);
                const role = roles.find((r) => r.name === 'RootAdmin' || r.name === 'AppAdmin');
                if (role) {
                //    goToOrgList();
                }
            }
        }
    }


    prepareSideNav() {
        const {name, organization, location, roles, goToOrgList, goToUsers, goToEvals, goToSettings, logOut, goToDataImport} = this.props;
        return (
            <ul id="side-nav" className="side-nav">
                <li>
                    <div className="user-view">
                        <a className="org-name"><span className="white-text name">{organization.name}</span></a>
                        <a className="user-name"><span className="white-text email">{name}</span></a>
                    </div>
                </li>
                <li className={location === '/' || location === '/evaluations' ? 'acitve': ''}>
                    <a onClick={() => goToEvals(roles.find((r) => r.name === 'AppAdmin' || r.name === 'RootAdmin'))}>Evaluations</a>
                </li>
                {roles.find((r) => r.name === 'AppAdmin' || r.name === 'RootAdmin' || r.name === 'OrgAdmin') ?
                    <li className={location === '/users' ? 'active' : ''}>
                        <a onClick={goToUsers}>Users</a>
                    </li> : null}
                {roles.find((r) => r.name === 'AppAdmin' || r.name === 'RootAdmin') ?
                    <li className={location === '/organizations' ? 'active' : ''}>
                        <a onClick={goToOrgList}>Organizations</a>
                    </li> : null}
                {roles.find((r) => r.name === 'AppAdmin' || r.name === 'RootAdmin') ?
                    <li className={location === '/data/imports' ? 'active' : ''}>
                        <a onClick={goToDataImport}>Land Data Import</a>
                    </li> : null}
                <li>
                    <div className="divider"></div>
                </li>
                <li className={location === '/settings' ? 'active' : ''} disabled={true}>
                    <a onClick={goToSettings}>Settings</a>
                </li>
                <li>
                    <a onClick={logOut}>Log Out</a>
                </li>
            </ul>
        );
    }

    render() {
        const {isUserFetching, name} = this.props;
        if (isUserFetching) {
            return (
                <div>
                    <Header />
                    <div className="valign-wrapper" style={{width: '100%', height: '100%'}}>
                        <div className="valign row" style={{width: '100%'}}>
                            <div className="col s12">
                                <div className="center">
                                    <Spinner />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <div>
                {/* <Header displayName={name} openNav={openSideNav} sideNav={this.prepareSideNav()} mDialog={this.openMDialog1()}/> */}
                <Header logOut={this.props.logOut} goToSettings={this.props.goToSettings}/>
                {this.props.children}
            </div>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App)