/**
 * Created by rayde on 11/14/2017.
 */
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {push} from 'react-router-redux'
import OrganizationFormComponent from '../components/OrganizationFormComponent'
import * as actionTypes from '../ducks/constants'
import {createOrg, fetchAllCounties} from '../ducks/organization'
import Spinner from '../components/Spinner'
import SuperSelectField from 'material-ui-superselectfield'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import AreaCountySelect from '../components/AreaCountySelect'


const mapStateToProps = (state, ownProps) => {
    return {
        isCreatingOrg: state.organization.isCreating,
        isFetchingAllCounties: state.organization.isFetchingCounties,
        allCounties: state.organization.counties,
        location: ownProps.location.pathname
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        createOrg: (payload) => {
            dispatch(createOrg(actionTypes.CREATE, payload));
        },
        getCounties: () => {
            dispatch(fetchAllCounties(actionTypes.FETCH));
        }
    };
};

class OrganizationForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            address: {
                address1: '',
                address2: '',
                city: '',
                state: '',
                postalCode: '',
                country: 'USA'
            },
            farmableFactor: '',
            nonfarmableFactor: '',
            irrigationFactor: '',
            userInvites: [],
            userInvite: {
                name: '',
                email: '',
                role: ''
            },
            inviteCounter: 0,
            counties: [],
            newCounties: [],
            areas: [],
            newArea: {}
        };
        this.handleOrgFormChange = this.handleOrgFormChange.bind(this);
        this.onInviteChange = this.onInviteChange.bind(this);
        this.addInvite = this.addInvite.bind(this);
        this.deleteInvite = this.deleteInvite.bind(this);
        this.renderSpinner = this.renderSpinner.bind(this);
        this.onClickSubmit = this.onClickSubmit.bind(this);
        this.onCountyChange = this.onCountyChange.bind(this);
        this.onNewAreaChange = this.onNewAreaChange.bind(this);
        this.addArea = this.addArea.bind(this);
        this.removeArea = this.removeArea.bind(this);
    }

    componentDidMount() {
        $('.dropdown-button').dropdown({
            inDuration: 300,
            outDuration: 225,
            constrainWidth: true, // Does not change width of dropdown to that of the activator
            hover: true, // Activate on hover
            gutter: 0, // Spacing from edge
            belowOrigin: false, // Displays dropdown below the button
            alignment: 'left', // Displays dropdown with edge aligned to the left of button
            stopPropagation: false // Stops event propagation
        });
        if (!this.props.isFetchingAllCounties && this.props.allCounties.length === 0) {
            this.props.getCounties();
        }
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

    onInviteChange(field) {
        return (event) => {
            if (field === 'role') {
                this.setState({
                    userInvite: Object.assign({}, this.state.userInvite, {
                        role: event
                    })
                })
            }
            else {
                let newInvite = {};
                newInvite[field] = event.target.value;
                this.setState({
                    userInvite: Object.assign({}, this.state.userInvite, newInvite)
                })
            }
        }
    }

    addInvite() {
        let newInvite = this.state.userInvite;
        if (newInvite.email === '' || newInvite.name === '' || newInvite === 'role') {
            Materialize.toast('You need to fill out all the fields to add a new user', 4000, 'red');
            return;
        }
        newInvite.tempId = this.state.inviteCounter + 1;
        this.setState({
            userInvites: this.state.userInvites.concat(newInvite),
            inviteCounter: newInvite.tempId,
            userInvite: {
                name: '',
                email: '',
                role: ''
            }
        });
    }

    deleteInvite(id) {
        return () => {
            this.setState({
                userInvites: this.state.userInvites.filter((invite) => invite.tempId !== id)
            });
        };
    }

    onClickSubmit() {
        const {createOrg} = this.props;
        const {name, address, userInvites, areas, counties, farmableFactor, nonfarmableFactor} = this.state;
        const cleanedAreas = areas.map((area) => {
            return Object.assign({}, area, {
                counties: area.counties.map((county) => {
                    return county.value
                })
            });
        });
        if (name === '') {
            Materialize.toast('Missing parameter - name', 4000, 'red');
            return;
        }
        if (address.address1 === '') {
            Materialize.toast('Missing parameter - Address 1', 4000, 'red');
            return;
        }
        if (address.city === '') {
            Materialize.toast('Missing parameter - City', 4000, 'red');
            return;
        }
        if (address.state === '') {
            Materialize.toast('Missing parameter - State', 4000, 'red');
            return;
        }
        if (address.postalCode === '') {
            Materialize.toast('Missing parameter - Postal Code', 4000, 'red');
            return;
        }
        if (userInvites.length === 0) {
            Materialize.toast('You need to have a least 1 Admin user.', 4000, 'red');
            return;
        }
        if (!userInvites.find((invite) => invite.role === 'OrgAdmin')) {
            Materialize.toast('You need to have a least 1 Admin user', 4000, 'red');
            return;
        }

        createOrg({organization: {name, address, farmableFactor: farmableFactor == '' ? null : parseFloat(farmableFactor),
        nonfarmableFactor: nonfarmableFactor == '' ? null : parseFloat(nonfarmableFactor),
         areas: cleanedAreas, counties: counties.map((county) => county.value)}, userInvites});
    }

    renderSpinner() {
        if (this.props.isCreatingOrg) {
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

    onCountyChange(selectedValues) {
        this.setState({
            counties: selectedValues
        });
    }

    onNewAreaChange(field) {
        return (event) => {
            let newField = {};
            newField[field] = field === 'name' ? event.target.value : event;
            this.setState({
                newArea: Object.assign({}, this.state.newArea, newField)
            })
        };
    }

    addArea() {
        const {newArea} = this.state;
        if (newArea.name == null) {
            Materialize.toast('You need a name for your Area.', 6000, 'red');
            return;
        }
        if (newArea.counties == null) {
            Materialize.toast('You need to select some counties for your Area.', 6000, 'red');
            return;
        }
        this.setState({
            areas: this.state.areas.concat(newArea),
            newArea: {}
        });
    }

    removeArea(index) {
        return () => {
            this.setState({
                areas: this.state.areas.reduce((l, area, i) => {
                    if (index !== i) {
                        l.push(area);
                    }
                    return l;
                }, [])
            })
        }
    }

    render() {
        const {userInvite}  = this.state;
        return (
            <MuiThemeProvider>
                <div style={{marginLeft: '1rem', marginRight: '1rem'}}>

                    {this.renderSpinner()}
                    <div className="row">
                        <h1>New Organization</h1>
                    </div>
                    <div className="row">
                        <div className="divider"></div>
                    </div>
                    <div className="row">
                        <OrganizationFormComponent handleInputChange={this.handleOrgFormChange} name={this.state.name}
                                                   address={this.state.address}  handleInputChange={this.handleOrgFormChange} farmableFactor={this.state.farmableFactor}
                                                      nonfarmableFactor={this.state.nonfarmableFactor} irrigationFactor={this.state.irrigationFactor}
                                                   location={this.props.location}/>
                    </div>
                    <div className="row">
                        <div className="divider"></div>
                    </div>
                    <div className="row">
                        <h3>Users:</h3>
                    </div>
                    <div className="row">
                        <table>
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email Address</th>
                                <th>Role</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.state.userInvites.map((invite) => {
                                return (
                                    <tr>
                                        <td>
                                            {invite.name}
                                        </td>
                                        <td>
                                            {invite.email}
                                        </td>
                                        <td>
                                            {invite.role === 'OrgAdmin' ? 'Admin' : 'User'}
                                        </td>
                                        <td>
                                            <button onClick={this.deleteInvite(invite.tempId)}
                                                    className="btn-floating waves-effect waves-light red">
                                                <i className="material-icons">remove</i>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            <tr>
                                <td>
                                    <div className="input-field">
                                        <input type="text" placeholder="Jonathan Tolkien" value={userInvite.name}
                                               onChange={this.onInviteChange('name')}/>
                                    </div>
                                </td>
                                <td>
                                    <div className="input-field">
                                        <input type="email" placeholder="jrrtolkien@example.com"
                                               value={userInvite.email}
                                               onChange={this.onInviteChange('email')}/>
                                    </div>
                                </td>
                                <td>
                                    <div className="input-field">
                                        <a className="dropdown-button col s12 e-value-text-yellow"
                                           data-activates="roleDropdown"
                                           data-gutter="0" data-constrainwidth="true"
                                           data-stoppropagation="true">
                                            <input id="state" type="text"
                                                   value={userInvite.role === '' ? 'Pick a Role' : userInvite.role === 'OrgAdmin' ? 'Admin' : 'User'}
                                                   className="col s10"/>
                                            <i className="material-icons medium right col s2"
                                               style={{paddingTop: '1rem'}}>arrow_drop_down</i>
                                        </a>
                                        <ul id='roleDropdown' className='dropdown-content'>
                                            <li className={userInvite.role === 'OrgUser' ? 'selected' : ''}>
                                                <a onClick={() => this.onInviteChange('role')('OrgUser')}
                                                   className="e-value-text-yellow">
                                                    User
                                                </a>
                                            </li>
                                            <li className={userInvite.role === 'OrgAdmin' ? 'selected' : ''}>
                                                <a onClick={() => this.onInviteChange('role')('OrgAdmin')}
                                                   className="e-value-text-yellow">
                                                    Org Admin
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </td>
                                <td>
                                    <button onClick={this.addInvite}
                                            className="btn-floating waves-effect waves-light e-value-yellow">
                                        <i className="material-icons">add</i>
                                    </button>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="row">
                        <div className="divider"></div>
                    </div>
                    <div className="row">
                        <h3>Counties:</h3>
                    </div>
                    <div className="row">
                        <p><i>You need to add counties to organization in order to create Areas.</i></p>
                    </div>
                    <div className="row" style={{paddingBottom: '2rem'}}>
                        {this.props.isFetchingAllCounties ?
                            <div className="center">
                                <Spinner />
                            </div> :
                            <div className="col s12">
                                <SuperSelectField onChange={this.onCountyChange}
                                                  value={this.state.counties}
                                                  name="Existing Counties" hintText="Pick a county" multiple>
                                    {this.props.allCounties.map((county) => {
                                        return (
                                            <option key={county.id} value={county.id}
                                                    label={county.county + ', ' + county.state}>
                                                {county.county + ',' + county.state}
                                            </option>
                                        );
                                    })}
                                </SuperSelectField>
                            </div>}
                    </div>
                    <div className="row">
                        <div className="divider"></div>
                    </div>
                    <div className="row">
                        <h3>Areas:</h3>
                    </div>
                    <div className="row">
                        <table>
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Counties</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.state.areas.map((area, index) => {
                                return (<tr key={index}>
                                    <td>{area.name}</td>
                                    <td>{area.counties.reduce((countyString, county) => {
                                        if(countyString === ''){
                                            return county.label;
                                        }
                                        return countyString + "," + county.label
                                    }, '')}</td>
                                    <td>
                                        <button className="btn btn-floating red" onClick={this.removeArea(index)}>
                                            <i className="material-icons">remove</i></button>
                                    </td>
                                </tr>);
                            })}
                            <tr>
                                <td>
                                    <div className="input-field">
                                        <input onChange={this.onNewAreaChange('name')}
                                               value={this.state.newArea.name == null ? '' : this.state.newArea.name}
                                               type="text" placeholder="Area1"/>
                                    </div>
                                </td>
                                <td>
                                    <AreaCountySelect onChange={this.onNewAreaChange('counties')}
                                                      areaCounties={this.state.newArea.counties == null ?
                                                      [] : this.state.newArea.counties} counties={this.state.counties}/>
                                </td>
                                <td>
                                    <button className="btn btn-floating e-value-yellow" onClick={this.addArea}><i
                                        className="material-icons">add</i>
                                    </button>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="row" style={{paddingTop: '5rem', paddingBottom: '3rem'}}>
                        <button onClick={this.onClickSubmit} className="e-value-yellow btn col s4 offset-s4">Save
                        </button>
                    </div>

                </div>
            </MuiThemeProvider>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(OrganizationForm)
