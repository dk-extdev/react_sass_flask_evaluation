import React, {Component} from 'react'
import {numToCurrency, precisionRounding} from '../helpers'
import {Input} from 'react-materialize'
// Make some constants for Improvmetns

// Condition constants
const FAIR = 'FAIR'
const AVERAGE = 'AVERAGE'
const GOOD = 'GOOD'
const EXCELLENT = 'EXCELLENT'
const conditionLabels = {
  [FAIR]: 'Fair',
  [AVERAGE]: 'Average',
  [GOOD]: 'Good',
  [EXCELLENT]: 'Excellent'
};

// Building Constants
const AG_BUILDING = 'AG_BUILDING';
const AG_SHED = 'AG_SHED';
const AG_SHELTER = 'AG_SHELTER';
const ARENA = 'ARENA';
const BARN = 'BARN';
const COMMDTY_SHED = 'COMMDTY_SHED';
const FARM_HOUSE = 'FARM_HOUSE';
const FARM_MOBILE_HOME = 'FARM_MOBILE_HOME';
const FENCE = 'FENCE';
const GARAGE = 'GARAGE';
const GRAIN_BIN = 'GRAIN_BIN';
const GREENHOUSE_HOOP = 'GREENHOUSE_HOOP';
const HAY_BARN = 'HAY_BARN';
const HORSE_ARENA = 'HORSE_ARENA';
const HORSE_BARN = 'HORSE_BARN';
const HOUSE_1STY = 'HOUSE_1STY';
const HOUSE_2STY = 'HOUSE_2STY';
const MACH_EQUIP_SHED = 'MACH_EQUIP_SHED';
const POLE_BARN = 'POLE_BARN';
const TOBACCO_SHEDS = 'TOBACCO_SHEDS';

const buildingLookUp = {
    [AG_BUILDING]: {
        label: 'Ag. Building.',
        unitType: 'sq. ft.',
        [FAIR]: 3.53,
        [AVERAGE]: 5.50,
        [GOOD]: 8.35,
        [EXCELLENT]: 12.00
    },
    [AG_SHED]: {
        label: 'Ag. Shed',
        unitType: 'sq. ft.',
        [FAIR]: 3.00,
        [AVERAGE]: 6.00,
        [GOOD]: 9.30,
        [EXCELLENT]: 10.00
    },
    [AG_SHELTER]: {
        label: 'Ag. Shelter',
        unitType: 'sq. ft.',
        [FAIR]: 2.25,
        [AVERAGE]: 4.00,
        [GOOD]: 4.00,
        [EXCELLENT]: 5.00
    },
    [ARENA]: {
        label: 'Arena',
        unitType: 'sq. ft.',
        [FAIR]: 3.75,
        [AVERAGE]: 9.00,
        [GOOD]: 13.00,
        [EXCELLENT]: 21.00
    },
    [BARN]: {
        label: 'Barn',
        unitType: 'sq. ft.',
        [FAIR]: 1.50,
        [AVERAGE]: 7.50,
        [GOOD]: 13.00,
        [EXCELLENT]: 24.00
    },
    [COMMDTY_SHED]: {
        label: 'Commdty Shed',
        unitType: 'sq. ft.',
        [FAIR]: 0.75,
        [AVERAGE]: 1.50,
        [GOOD]: 2.00,
        [EXCELLENT]: 3.00
    },
    [FARM_HOUSE]: {
        label: 'Farm House',
        unitType: 'sq. ft.',
        [FAIR]: 10.00,
        [AVERAGE]: 20.00,
        [GOOD]: 30.00,
        [EXCELLENT]: 50.00
    },
    [FARM_MOBILE_HOME]: {
        label: 'Farm Mobile Home',
        unitType: 'sq. ft.',
        [FAIR]: 5.00,
        [AVERAGE]: 7.00,
        [GOOD]: 10.00,
        [EXCELLENT]: 15.00
    },
    [FENCE]: {
        label: 'Fence',
        unitType: 'lin. Ft.',
        [FAIR]: 1.00,
        [AVERAGE]: 2.00,
        [GOOD]: 3.00,
        [EXCELLENT]: 5.50
    },
    [GARAGE]: {
        label: 'Garage',
        unitType: 'sq. ft.',
        [FAIR]: 3.75,
        [AVERAGE]: 10.25,
        [GOOD]: 15.50,
        [EXCELLENT]: 26.00
    },
    [GRAIN_BIN]: {
        label: 'Grain Bin',
        unitType: 'bu.',
        [FAIR]: 0.20,
        [AVERAGE]: 0.30,
        [GOOD]: 0.40,
        [EXCELLENT]: 0.80
    },
    [GREENHOUSE_HOOP]: {
        label: 'Greenhouse-hoop',
        uniType: 'sq. ft.',
        [FAIR]: 0.38,
        [AVERAGE]: 0.88,
        [GOOD]: 1.25,
        [EXCELLENT]: 2.00
    },
    [HAY_BARN]: {
        label: 'Hay barn',
        unitType: 'sq. ft.',
        [FAIR]: 1.50,
        [AVERAGE]: 4.00,
        [GOOD]: 6.00,
        [EXCELLENT]: 10.00
    },
    [HORSE_ARENA]: {
        label: 'Horse Arena',
        unitType: 'sq. ft.',
        [FAIR]: 6.00,
        [AVERAGE]: 12.00,
        [GOOD]: 12.00,
        [EXCELLENT]: 16.00
    },
    [HORSE_BARN]: {
        label: 'Horse Barn',
        unitType: 'sq. ft.',
        [FAIR]: 3.75,
        [AVERAGE]: 10.00,
        [GOOD]: 15.00,
        [EXCELLENT]: 25.00
    },
    [HOUSE_1STY]: {
        label: 'House/ 1sty',
        unitType: 'sq. ft.',
        [FAIR]: 7.50,
        [AVERAGE]: 26.25,
        [GOOD]: 42.50,
        [AVERAGE]: 75.00
    },
    [HOUSE_2STY]: {
        label: 'House/ 2 sty',
        unitType: 'sq. ft.',
        [FAIR]: 7.50,
        [AVERAGE]: 26.25,
        [GOOD]: 42.50,
        [EXCELLENT]: 75.00
    },
    [MACH_EQUIP_SHED]: {
        label: 'Mach/equip shed',
        unitType: 'sq. ft.',
        [FAIR]: 1.50,
        [AVERAGE]: 4.00,
        [GOOD]: 6.00,
        [EXCELLENT]: 10.00
    },
    [POLE_BARN]: {
        label: 'Pole Barn',
        unitType: 'sq. ft.',
        [FAIR]: 1.50,
        [AVERAGE]: 4.00,
        [GOOD]: 6.00,
        [EXCELLENT]: 10.00
    },
    [TOBACCO_SHEDS]: {
        label: 'Tobacco Seds',
        unitType: 'sq. ft.',
        [FAIR]: 1.31,
        [GOOD]: 2.44,
        [AVERAGE]: 3.13,
        [EXCELLENT]: 4.50
    }
}
class ImprovementsComponent extends Component {
  constructor(props){
      super(props);
      this.state = {
          newImprovement: '',
          newCondition: '',
          newTotalUnits: ''
      };
      this.onChange = this.onChange.bind(this);
      this.onClickAddImprovement = this.onClickAddImprovement.bind(this);
  }
  onChange(field){
      return (event) => {
          this.setState({
              [field]: event.target.value
          });
      };
  }
  onClickAddImprovement(){
      const {newImprovement, newCondition, newTotalUnits} = this.state;
      if(newImprovement == ""){
          Materialize.toast('You need to select a building type', 6000, 'red');
          return;
      }

      if(newCondition == ""){
          Materialize.toast('You need to select a condition', 6000, 'red');
          return;
      }

      if(newTotalUnits == ""){
          Materialize.toast('You need to enter the total untils', 6000, 'red');
          return;
      }
      const buildingInfo = buildingLookUp[newImprovement];
      this.props.addImprovement({
          buildingType: newImprovement,
          condition: newCondition,
          unitType: buildingInfo.unitType,
          totalUnits: newTotalUnits,
          marketExtractedContributionUnit: buildingInfo[newCondition],
          valueUnitCalculation: buildingInfo[newCondition] * newTotalUnits
      });
      this.setState({
          newCondition: '',
          newImprovement: '',
          newTotalUnits: ''
      });
  }
  render(){
    const {improvements, removeImprovement} = this.props;
    return (
      <div className="w-col">
          <div className="row">
              <h1 className="e-value-text-green">Improvements:</h1>
          </div>
          <div className="row">
              <table>
                <thead>
                    <tr>
                        <th className="eval-field-label">Improvements</th>
                        <th className="eval-field-label">Condition</th>
                        <th className="eval-field-label">Unit of Measure</th>
                        <th className="eval-field-label">Total Units</th>
                        <th className="eval-field-label">Market Extracted Contribution/Unit</th>
                        <th className="eval-field-label">Value/Unit</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                  {improvements.improvements.map((improvement, index) => {
                      const buildingInfo = buildingLookUp[improvement.buildingType]
                      return (
                          <tr key={index}>
                              <td className="label-2">{buildingInfo.label}</td>
                              <td className="label-2">{conditionLabels[improvement.condition]}</td>
                              <td className="label-2">{buildingInfo.unitType}</td>
                              <td className="label-2">{improvement.totalUnits}</td>
                              <td className="label-2">{numToCurrency(buildingInfo[improvement.condition], 2)}</td>
                              <td className="label-2">{numToCurrency(improvement.valueUnitCalculation)}</td>
                              <td className="label-2"><button onClick={() => removeImprovement(index)} className="btn-floating red waves-effect waves-light"><i className="material-icons">remove</i></button></td>
                          </tr>
                      );
                  })}
                  <tr>
                      <td className="w-col-select">
                          <select className="eval-input w-input-select" value={this.state.newImprovement} onChange={this.onChange('newImprovement')}>
                              <option value=""></option>
                              {Object.keys(buildingLookUp).map((building) => {
                                  return (
                                      <option value={building}>{buildingLookUp[building].label}</option>
                                  );
                              })}
                          </select>
                      </td>
                      <td className="w-col-select">
                          <select className="eval-input w-input-select" value={this.state.newCondition} onChange={this.onChange('newCondition')}>
                              <option value=""></option>
                              {Object.keys(conditionLabels).map((condition) => {
                                  return (
                                      <option value={condition}>{conditionLabels[condition]}</option>
                                  );
                              })}
                          </select>
                      </td>
                      <td className="label-2">
                          {this.state.newImprovement == "" ? 'N/A' : buildingLookUp[this.state.newImprovement].unitType}
                      </td>
                      <td className="label-2">
                          <div className="input-field">
                              <input id="totalUnits" className="eval-input w-input" type="number" placeholder="" value={this.state.newTotalUnits} onChange={this.onChange('newTotalUnits')}/>
                          </div>
                      </td>
                      <td className="label-2">
                          {this.state.newImprovement == "" || this.state.newCondition == "" ? 'N/A' : numToCurrency(buildingLookUp[this.state.newImprovement][this.state.newCondition], 2)}
                      </td>
                      <td className="label-2">
                          {this.state.newImprovement == "" || this.state.newCondition == "" || this.state.newTotalUnits == "" ? 'N/A' : numToCurrency(buildingLookUp[this.state.newImprovement][this.state.newCondition] * this.state.newTotalUnits)}
                      </td>
                      <td>
                          <button onClick={this.onClickAddImprovement} className="btn-floating green waves-effect waves-light"><i className="material-icons">add</i></button>
                      </td>
                  </tr>
                </tbody>
              </table>
          </div>
          {/* <div className="divider"></div>
          <div className="row">
              <div className="col s6 offset-s6">
                  <div className="col s7">
                      <p><b>Total Improvements Value:</b></p>
                  </div>
                  <div className="col s5">
                      <p><b>{numToCurrency(improvements.totalImprovementsValue)}</b></p>
                  </div>
              </div>
          </div> */}
      </div>
    );
  }
}

export default ImprovementsComponent
