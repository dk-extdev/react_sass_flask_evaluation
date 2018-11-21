/**
 * Created by rayde on 11/14/2017.
 */
import React, {Component} from 'react'
import {connect} from 'react-redux'
import OrganizationCard from '../components/OrganizationCard'
import * as actionTypes from '../ducks/constants'
import {fetchOrgs, disableEnableOrg} from '../ducks/organization'
import Spinner from '../components/Spinner'
import {push} from 'react-router-redux'

const mapStateToProps = (state) => {
  return {
      isOrgFetching: state.organization.isFetching,
      hasOrgFetched: state.organization.hasFetched,
      organizations: state.organization.organizations
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
      getOrgs: () => {
          dispatch(fetchOrgs(actionTypes.FETCH));
      },
      goToNewOrg: () => {
          dispatch(push('/organizations/new'))
      },
      goToOrg: (orgId) => {
          dispatch(push(`/organizations/${orgId}`))
      },
      toggleOrgStatus: (orgId) => {
          dispatch(disableEnableOrg(actionTypes.UPDATE, {orgId}));
      }
  }
};

class OrganizationList extends Component {
    constructor(props){
        super(props);
        this.renderOrganizationCards = this.renderOrganizationCards.bind(this);
    }
    componentDidMount(){
        const {isOrgsFetching, hasOrgsFetched, getOrgs} = this.props;
        if(!isOrgsFetching && !hasOrgsFetched){
            getOrgs();
        }
        $('.tooltipped').tooltip({delay: 50});
    }
    componentDidUpdate(prevProps){
        if(prevProps.isOrgsFetching === true && this.props.isOrgsFetching === true){
            $('.tooltipped').tooltip({delay: 50});
        }
    }
    componentWillUnmount(){
        $('.tooltipped').tooltip('remove');
    }
    renderOrganizationCards(){
        const {organizations, goToOrg} = this.props;
        const numRows = Math.ceil(organizations.length / 4);
        let rows = [];
        for(let r = 0; r < numRows; r++){
            let row = [];
            const rowIndexStart = r * 4;
            const rowIndexEnd = (rowIndexStart + 4) >= organizations.length ? organizations.length : rowIndexStart + 4;
            for(let i = rowIndexStart; i < rowIndexEnd; i++){
                const organization = organizations[i];
                row.push(
                    <div className="col l3 m6 s12" key={organization.id}>
                        <OrganizationCard id={organization.id} goToOrg={() => goToOrg(organization.id)}
                                          name={organization.name} addressLine1={organization.address.address1 + ' ' +
                                          (organization.address.address2 == null ? '' : organization.address.address2)}
                                          addressLine2={organization.address.city + ', ' + organization.address.state + ' ' + organization.address.postalCode}
                                          disabled={organization.disabled} toggleOrgStatus={() => this.props.toggleOrgStatus(organization.id)}/>
                    </div>
                );
            }
            rows.push(
                <div className="row" key={r}>
                    {row}
                </div>
            );
        }
        return rows;
    }
    render(){
        const {isOrgFetching, goToNewOrg} = this.props;
        if(isOrgFetching){
            return (
                <div>
                    <div className="row">
                        <h1>Organizations</h1>
                    </div>
                    <div className="row" style={{height: '100%'}}>
                        <div className="center">
                            <Spinner />
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <div>
                <div className="fixed-action-btn">
                    <button className="btn-floating btn-large e-value-yellow tooltipped pulse" data-position="left" data-delay="50"
                            data-tooltip="Add a new Organization" onClick={goToNewOrg}>
                        <i className="large material-icons">add</i>
                    </button>
                </div>
                <div className="row">
                    <h1 className="e-value-text-green">
                        Organizations
                    </h1>
                </div>
                <div className="divider"></div>
                <div className="row card-container">
                    {this.renderOrganizationCards()}
                </div>
            </div>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(OrganizationList)
