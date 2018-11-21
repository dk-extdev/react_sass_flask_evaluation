/**
 * Created by rayde on 1/2/2018.
 */
import React, {Component} from 'react'
import AreaCountySelect from '../components/AreaCountySelect'
import SuperSelectField from 'material-ui-superselectfield'
import Spinner from './Spinner'

const countyCompare = (a, b) => {
  if(a.state === b.state){
    return a.county > b.county ? 1 : a.county < b.county ? -1 : 0;
  }
  else {
    return a.state > b.state ? 1 : a.state < b.state ? -1 : 0
  }
}

class AreaTab extends Component {
    constructor(props) {
        super(props);
        const {counties, allCounties} = this.props;
        this.state = {
            counties: counties == null ? [] : counties.sort(countyCompare).map((county) => {
                return {value: county.id, label: county.county + ', ' + county.state}
            }),
            allCounties: allCounties == null ? [] : allCounties.sort(countyCompare).map((county) => {
                return {value: county.id, label: county.county + ', ' + county.state};
            }),
            newAreas: [],
            newArea: {}
        };
        this.onCountyChange = this.onCountyChange.bind(this);
        this.onNewAreaChange = this.onNewAreaChange.bind(this);
        this.addArea = this.addArea.bind(this);
        this.removeArea = this.removeArea.bind(this);
        this.saveAreas = this.saveAreas.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.counties.length === 0 && this.props.counties.length > 0) {
            this.setState({
                counties: this.props.counties.sort(countyCompare).map((county) => {
                    return {value: county.id, label: county.county}
                }),
                allCounties: this.props.allCounties == null ? [] : this.props.allCounties.sort(countyCompare).map((county) => {
                    return {value: county.id, label: county.county + ', ' + county.state};
                })
            })
        }
        if(prevProps.isCreatingAreas === true && this.props.isCreatingAreas === false){
            this.setState({
                newAreas: []
            })
        }
    }

    onCountyChange(selectedValues) {
        this.setState({
            counties: selectedValues
        })
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
            newAreas: this.state.newAreas.concat(newArea),
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

    saveAreas(){
        const {counties, newAreas} = this.state;
        const cleanedAreas = newAreas.map((area) => {
            area.counties = area.counties.map(county => parseInt(county.value));
            return area;
        });
        this.props.saveAreas(counties.map((county) => county.value), cleanedAreas);
    }

    render() {
        if (this.props.isFetchingAllCounties || this.props.isFetchingOrgs || this.props.isCreatingAreas) {
            return (
                <div id="areas" className="col s12 valign-wrapper">
                    <div className="row valign">
                        <div className="center">
                            <Spinner />
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <div id="areas" className="col s12 text-padding">
                <div className="row">
                    <h3>Counties:</h3>
                </div>
                <div className="row">
                    <p><i>You need to add counties to organization in order to create Areas.</i></p>
                </div>
                <div className="row">
                    <div>
                        <SuperSelectField onChange={this.onCountyChange}
                                          value={this.state.counties} name="Counties" hintText="Add a county" multiple>
                            {this.props.allCounties.sort(countyCompare).map((county) => {
                                return (
                                    <option key={county.id} value={county.id} label={county.county + ', ' + county.state}>
                                        {county.county + ', ' + county.state}
                                    </option>
                                );
                            })}
                        </SuperSelectField>
                    </div>
                </div>
                <div className="row">
                    <h3>Areas:</h3>
                </div>
                <div className="row">
                    <p><i>Clients will be able to filter data only by Areas, Entire Market Area (all counites associated with Org), or by single counties associated with an org..</i></p>
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
                        {this.props.areas.map((area) => {
                            return (
                                <tr>
                                    <td>{area.name}</td>
                                    <td>{area.counties.reduce((countyString, county) => {
                                        if (countyString == '') {
                                            return county.county;
                                        }
                                        return countyString + ', ' + county.county
                                    }, '')}</td>
                                    <td>
                                        <button className="btn btn-floating red"
                                                onClick={() => this.props.deleteArea(this.props.org.id, area.id)}>
                                            <i className="material-icons">remove</i></button>
                                    </td>
                                </tr>
                            );
                        })}
                        {this.state.newAreas.map((area, index) => {
                            return (<tr key={index}>
                                <td>{area.name}</td>
                                <td>{area.counties.reduce((countyString, county) => {
                                    if (countyString === '') {
                                        return county.label;
                                    }
                                    return countyString + "," + county.label
                                }, '')}</td>
                                <td>
                                    <button className="btn btn-floating red"
                                            onClick={this.removeArea(index)}>
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
                <div className="row">
                    <button className="btn e-value-yellow col s4 offset-s4" onClick={this.saveAreas}>Save</button>
                </div>
            </div>
        );
    }
}

export default AreaTab
