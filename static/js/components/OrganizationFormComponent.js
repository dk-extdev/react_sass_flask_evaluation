/**
 * Created by rayde on 11/25/2017.
 */
import React, {Component} from 'react'
const states = require('../states.json');

class OrganizationFormComponent extends Component {
  constructor(props) {
    super(props);
    this.renderStatesDropdown = this.renderStatesDropdown.bind(this);
  }

  componentDidMount() {
    $('.dropdown-button').dropdown({
      inDuration: 300, outDuration: 225, constrainWidth: true, // Does not change width of dropdown to that of the activator
      hover: true, // Activate on hover
      gutter: 0, // Spacing from edge
      belowOrigin: true, // Displays dropdown below the button
      alignment: 'left', // Displays dropdown with edge aligned to the left of button
      stopPropagation: false // Stops event propagation
    });
    $('label').addClass('active')
  }

  componentDidUpdate(prevProps) {
    if (prevProps.address.state !== this.props.address.state) {
      $('.dropdown-button').dropdown({
        inDuration: 300, outDuration: 225, constrainWidth: true, // Does not change width of dropdown to that of the activator
        hover: true, // Activate on hover
        gutter: 0, // Spacing from edge
        belowOrigin: true, // Displays dropdown below the button
        alignment: 'left', // Displays dropdown with edge aligned to the left of button
        stopPropagation: false // Stops event propagation
      });
    }
    $('label').addClass('active')
  }

  renderStatesDropdown() {
    const {address, handleInputChange} = this.props;
    return Object.keys(states).map((abbr) => {
      return (<li key={abbr} className={address.state === abbr
          ? 'selected'
          : ''}>
        <a onClick={() => handleInputChange('state')(abbr)} className="e-value-text-yellow">{states[abbr]}</a>
      </li>);
    })
  }

  render() {
    const {handleInputChange, name, address, farmableFactor, nonfarmableFactor, irrigationFactor} = this.props;
    return (<div >
      <div className="row">
        <div className="col s12 input-field">
          <label className="active" htmlFor="name">Organization Name
          </label>
          <input id="name" type="text" value={name} onChange={handleInputChange('name')} placeholder="Organization Name"/>
        </div>
      </div>
      <div className="row">
        <div className="col s6 input-field">
          <input id="address1" type="text" value={address.address1} onChange={handleInputChange('address1')}/>
          <label htmlFor="address1" className="active">Address 1</label>
        </div>
        <div className="col s6 input-field">
          <input id="address2" type="text" value={address.address2} onChange={handleInputChange('address2')}/>
          <label htmlFor="address2" className="active">Address 2 (Optional)</label>
        </div>
      </div>
      <div className="row">
        <div className="col s6 input-field">
          <input id="city" type="text" value={address.city} onChange={handleInputChange('city')}/>
          <label htmlFor="city" className="active">City</label>
        </div>
        <div className="col s6 input-field">
          <a className="dropdown-button col s12 e-value-text-yellow" data-activates="stateDropdown" data-gutter="0" data-stoppropagation="true">
            <input id="state" type="text" value={address.state !== ''
                ? states[address.state]
                : 'Pick a state'} className="col s10"/>
            <i className="material-icons medium right col s2" style={{
                paddingTop: 'rem'
              }}>arrow_drop_down</i>
          </a>
          <ul id='stateDropdown' className='dropdown-content'>
            {this.renderStatesDropdown()}
          </ul>
        </div>
      </div>
      <div className="row">
        <div className="col s6 input-field">
          <input id="postalCode" type="text" value={address.postalCode} onChange={handleInputChange('postalCode')}/>
          <label htmlFor="postalCode" className="active">Postal Code</label>
        </div>
        <div className="col s6 input-field">
          <input id="country" type="text" value="USA" readOnly={true}/>
          <label htmlFor="country" className="active">Country</label>
        </div>
      </div>
      <div className="row">
        <div className="col s6 input-field">
          <input id="farmableFactor" type="number" placeholder="1.15" step="0.01" value={farmableFactor} onChange={handleInputChange('farmableFactor')}/>
          <label htmlFor="farmableFactor" className="active">Farmable Factor</label>
        </div>
        <div className="col s6 input-field">
          <input id="nonfarmableFactor" type="number" placeholder="0.75" step="0.01" value={nonfarmableFactor} onChange={handleInputChange('nonfarmableFactor')}/>
          <label htmlFor="nonfarmableFactor" className="active">Non-Farmable Factor</label>
        </div>
      </div>
      <div className="row">
        <div className="col s6 input-field">
          <input id="irrigationFactor" type="number" placeholder="0.5" step="0.01" value={irrigationFactor} onChange={handleInputChange('irrigationFactor')}/>
          <label htmlFor="irrigationFactor" className="active">Irrigation Factor</label>
        </div>
        <button className={"btn e-value-yellow col s4 " + (this.props.location === '/organizations/new' ? 'hidden' : '')} onClick={this.props.updateOrg}>Update</button>
      </div>
    </div>);
  }
}

export default OrganizationFormComponent
