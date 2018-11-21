/**
 * Created by rayde on 11/25/2017.
 */
import React from 'react'

// Need a better way to not allow Admin account to be disabled.
const OrganizationCard = ({name, addressLine1, addressLine2, goToOrg, disabled, toggleOrgStatus, id}) => (
    <div className="card">
        <div className="card-content">
            <span className="card-title"><h3 className="e-value-text-yellow">{name}</h3></span>
            <div className="row">
                <p className="e-value-text-green">{addressLine1}</p>
                <p className="e-value-text-green">{addressLine2}</p>
            </div>
            <div className="row">
                <div className="left">
                    <p className="e-value-text-green">Evaluations: </p>
                </div>
                <div className="right">
                    <p className="e-value-text-yellow">12</p>
                </div>
            </div>
            <div className="row">
              <div className="left">
                  <p className="e-value-text-green">Status:</p>
              </div>
              <div className="right">
                  <p className={disabled ? 'red-text' : 'green-text'}>{disabled ? 'Disabled' : 'Active'}</p>
              </div>
            </div>
        </div>
        <div className="card-action">
            <a className="e-value-text-yellow waves-effect waves-light" style={{cursor: 'pointer'}} onClick={goToOrg}>Details</a>
            <i className="material-icons right activator" style={{cursor: 'pointer'}}>more_vert</i>
        </div>
        <div className="card-reveal">
          <span className="card-title e-value-text-yellow">{name}<i className="material-icons right grey-text">close</i></span>
          <div className="row col s12">
            <button className="col s8 offset-s2 btn blue waves-effect waves-light" onClick={goToOrg}>Details <i className="material-icons right">send</i></button>
          </div>
          <div className="row col s12">
            <button disabled={name == 'Ag Value' || id == 1} onClick={toggleOrgStatus} className={`col s8 offset-s2 btn waves-effect waves-light ${disabled ? 'amber' : 'green'}`}>
              {disabled ? 'Enable' : 'Disable'}
              {disabled ? <i className="material-icons right">lock_open</i> : <i className="material-icons right">lock</i>}
            </button>
          </div>
          <div className="row col s12">
            <button className="btn col s8 offset-s2" disabled={true}>Evaluations <i className="material-icons right">description</i></button>
          </div>
        </div>
    </div>

);

export default OrganizationCard