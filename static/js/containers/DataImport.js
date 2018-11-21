/**
 * Created by rayde on 12/12/2017.
 */
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {postLandData} from '../ducks/landData'
import * as actionTypes from '../ducks/constants'
const states = require('../states.json');
import Spinner from '../components/Spinner'
import XLSX from 'xlsx'
import {Input} from 'react-materialize'

const mapStateToProps = (state) => {
    return {
        isUploadingLandData: state.landData.isUploading
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        uploadData: (file, state, headerMapping) => {
            dispatch(postLandData(actionTypes.UPDATE, {file, state, headerMapping}));
        }
    }
};

class DataImport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataFile: null,
            fileProcessing: false,
            dataFileBinary: null,
            state: '',
            additionalEmails: '',
            headerMapping: {
            }
        };
        this.onFileChange = this.onFileChange.bind(this);
        this.clearFile = this.clearFile.bind(this);
        this.renderStatesDropdown = this.renderStatesDropdown.bind(this);
        this.upload = this.upload.bind(this);
        this.renderSpinner = this.renderSpinner.bind(this);
        this.onEmailsChange = this.onEmailsChange.bind(this);
        this.onHeaderMappingChange = this.onHeaderMappingChange.bind(this);
        this.mapHeaders = this.mapHeaders.bind(this);
    }

    componentDidMount() {
        $('.dropdown-button').dropdown({
            inDuration: 300,
            outDuration: 225,
            constrainWidth: true, // Does not change width of dropdown to that of the activator
            hover: true, // Activate on hover
            gutter: 0, // Spacing from edge
            belowOrigin: true, // Displays dropdown below the button
            alignment: 'left', // Displays dropdown with edge aligned to the left of button
            stopPropagation: false // Stops event propagation
        });
    }

    componentDidUpdate(prevProps) {
        if(prevProps.isUploadingLandData === true && this.props.isUploadingLandData === false){
            this.clearFile()
        }
    }

    renderStatesDropdown() {
        const {state} = this.props;
        return Object.keys(states).map((abbr) => {
            return (
                <li key={abbr} className={state === abbr ? 'selected' : ''}>
                    <a onClick={() => this.setState({state: abbr})}
                       className="e-value-text-yellow">{states[abbr]}</a>
                </li>
            );
        })
    }


    onFileChange(event) {
        const file = event.target.files[0];
        if (file != null) {
            this.setState({
                dataFile: file,
                fileProcessing: true
            });
            const reader = new FileReader();
            reader.onload = (upload) => {
                const data = upload.target.result
                let headerMapping = {};
                const workbook = XLSX.read(data.split('base64,')[1], {type: 'base64'});
                const xl_sheet = workbook.Sheets[workbook.SheetNames[0]];
                let headers = [];
                let range = XLSX.utils.decode_range(xl_sheet['!ref']);
                let C, R = range.s.r;
                /* start in the first row */
                /* walk every column in the range */
                for (C = range.s.c; C <= range.e.c; ++C) {
                    let cell = xl_sheet[XLSX.utils.encode_cell({c: C, r: R})];
                    /* find the cell in the first row */

                    let hdr = "UNKNOWN " + C; // <-- replace with your desired default
                    if (cell && cell.t) hdr = XLSX.utils.format_cell(cell);

                    headers.push(hdr);
                }
                headers.forEach((header) => {
                    headerMapping[header] = "";
                });
                this.setState({
                    fileProcessing: false,
                    dataFileBinary: data,
                    headerMapping
                });
            };

            reader.readAsDataURL(file);
        }
    }

    clearFile() {
        this.setState({
            dataFile: null,
            dataFileBinary: null,
            headerMapping: {}
        });
        $('.file-path').val(null).removeClass('valid');
        $('#file-uploader').val('');
    }

    upload(){
        const {state, dataFileBinary, dataFile, headerMapping} = this.state;
        const {uploadData} = this.props;
        const headers = ['Sale Date', 'Reconciled Property Type','Parcel Number', 'Sale Price', 'Acres', 'Current Use', 'County Reference'];
        if(dataFileBinary === null){
            Materialize.toast('You need to upload a file.', 6000, 'red');
            return;
        }
        if(state == ''){
            Materialize.toast('You need to select a state', 6000, 'red');
            return;
        }

        const duplicates = Object.keys(headerMapping).reduce((count, header, curIndex, arr) => {
            if (count !== true) {
                if (count[header] == null) {
                    count[header] = 1;
                }
                else {
                    return true;
                }
            }
            if (curIndex === arr.length - 1) {
                return false;
            }
            return count;
        }, {});
        if (duplicates) {
            Materialize.toast("You can't assign the same field to two different headers.", 6000, 'red');
            return;
        }

        const invertedMapping = Object.keys(headerMapping).reduce((dict, h) => {
            if(headerMapping[h] != null || headerMapping[h] != ''){
                dict[headerMapping[h]] = h;
            }
            return dict;
        }, {});

        const missingParams = headers.reduce((missing, param) => {
            if (invertedMapping[param] == null) {
                return true;
            }
            return missing
        }, false);
        if (missingParams) {
            Materialize.toast('You are either missing parameters in your file or you have not mapped them properly.', 6000, 'red');
            return;
        }



        uploadData(dataFile, state, invertedMapping)
    }

    renderSpinner(){
        if(this.props.isUploadingLandData){
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
    onEmailsChange(event) {
        this.setState({
            additionalEmails: event.target.value
        })
    }
    onHeaderMappingChange(fieldName){
        return (event) => {
            this.setState({
                headerMapping: Object.assign({},
                  this.state.headerMapping,
                  {
                    [fieldName]: event.target.value
                  })
            });
        };
    }
    mapHeaders(){
        const headers = ['Sale Date', 'Reconciled Property Type','Parcel Number', 'Sale Price', 'Acres', 'Current Use', 'County Reference'];
        const {headerMapping} = this.state;
        const fileHeaders = Object.keys(headerMapping);
        if(fileHeaders.length === 0){
            return (
                <div className="row">
                    <div className="center">
                        <h4 className="grey-text">No Headers</h4>
                    </div>
                </div>
            );
        }
        return fileHeaders.map((header) => {
            return (
                <div className="row">
                    <div className="col s6">
                        <h5>{header}:</h5>
                    </div>
                    <Input s={6} type="select" label={header + ' mapping'} onChange={this.onHeaderMappingChange(header)}
                      value={this.state.headerMapping[header] == null ? '' : this.state.headerMapping[header]}>
                        <option value="">None</option>
                        {headers.map((h) => {
                            return (
                                <option value={h}>{h}</option>
                            );
                        })}
                    </Input>
                </div>
            );
        })
    }
    render() {
        return (
            <div>
                {this.renderSpinner()}
                <div className="row">
                    <h1>
                        Land Data Import
                    </h1>
                </div>
                <div className="row">
                    <div className="divider"></div>
                </div>
                <div className="row container">
                    <div className="row">
                        <h4>Instructions:</h4>
                    </div>
                    <div className="row">
                        <ul className="browser-default">
                            <li>The Land Data file upload needs to be an excel spreadsheeet with the first sheet
                                containing the Land Data.
                            </li>
                            <li>You will have to map all the necessary fields to the name of the header column in the Excel </li>
                            <li>An email will automatically be sent to you but you can add additional emails. </li>
                            <li>Warning: This may take a while. </li>
                        </ul>
                    </div>
                    <div className="row">
                        <div className="col s6">
                            <div className="file-field input-field">
                                <div className="e-value-yellow btn col s6 ">
                                    <span>File</span>
                                    <input type="file" id="file-uploader" onChange={this.onFileChange}
                                           disabled={this.props.isUploadingLandData}/>
                                </div>
                                <div className="file-path-wrapper">
                                    { this.state.dataFile !== null || this.state.dataFileBinary !== null ?
                                        <i onClick={this.clearFile} className="material-icons prefix blue-grey-text"
                                           style={{paddingTop: '1%', cursor: 'pointer'}}>cancel</i>
                                        : null}
                                    <input className="file-path validate" type="text" placeholder="Optional"/>
                                </div>
                            </div>
                        </div>
                        <div className="col s6">
                            <div className="input-field">
                                <a className="dropdown-button col s12 e-value-text-yellow"
                                   data-activates="stateDropdown"
                                   data-gutter="0"
                                   data-stoppropagation="true">
                                    <input id="state" type="text"
                                           value={this.state.state !== '' ? states[this.state.state] : 'Pick a state'}
                                           className="col s10"/>
                                    <i className="material-icons medium right col s2" style={{paddingTop: 'rem'}}>arrow_drop_down</i>
                                </a>
                                <ul id='stateDropdown' className='dropdown-content'>
                                    <li className={this.state.state === "" ? "selected": ""}>
                                        <a className="e-value-text-yellow" onClick={() => this.setState({state: ""})}>N/A</a>
                                    </li>
                                    {this.renderStatesDropdown()}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col s12 input-field">
                            <label className="active" htmlFor="additionalEmails">Additional Emails</label>
                            <input id="additionalEmails" value={this.state.additionalEmails} type="text"
                              onChange={this.onEmailsChange} placeholder='john@e-valuereport.com,jane@e-valuereport.com'/>
                        </div>
                    </div>
                    {this.mapHeaders()}
                </div>
                 <div className="row">
                        <button disabled={this.props.isUploadingLandData} className="e-value-yellow btn col s4 offset-s4" onClick={() => this.upload()}>Upload</button>
                 </div>
            </div>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DataImport)
