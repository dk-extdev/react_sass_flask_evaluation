/**
 * Created by rayde on 1/8/2018.
 */
import React, {Component} from 'react'
import {Input} from 'react-materialize'
// import {SingleDatePicker} from 'react-dates'
import DatePicker from 'material-ui/DatePicker'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import ImprovementsComponent from './ImprovementsComponent'

class EvaluationParameters extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dateSoldFocused: false,
            dateOfInspectionFocused: false,
            dateOfSaleMinFocused: false,
            dateOfSaleMaxFocused: false
        };
        this.renderMarketArea = this.renderMarketArea.bind(this);
        this.renderMarketAreaInfo = this.renderMarketAreaInfo.bind(this);
        this.renderPropertyRatingFields = this.renderPropertyRatingFields.bind(this);
        this.renderPDFImages = this.renderPDFImages.bind(this);
        $('#evaluation').text('View Valuation');
    }

    componentDidMount() {
        $(document).ready(function () {
            $('.tooltipped').tooltip({delay: 50});
        });
    }

    componentWillUnmount() {
        $('.tooltipped').tooltip('remove');
    }

    renderMarketArea() {
        let areaOptions = this.props.areas.map((area) => {
            return (
                <option key={'area-'+area.id} value={'area-'+area.id} className="tooltipped" data-position="right"
                        data-delay="50"
                        data-tooltip={area.counties.map((county) => county.county).join(', ')}>
                    {area.name}
                </option>
            );
        });

        let countyOptions = this.props.counties.map((county) => {
            return (
                <option key={'county-'+county.id} value={'county-'+county.id}>
                    {county.county}
                </option>
            );
        });
        return areaOptions.concat(countyOptions);
    }

    renderMarketAreaInfo() {
        const {marketArea} = this.props.parameters;
        if (marketArea === 'entireMarketArea') {
            return this.props.counties.map((county) => county.county).join(',')
        }
        if (marketArea.includes('area')) {
            const areaId = parseInt(marketArea.split('-')[1]);
            return this.props.areas.find((area) => area.id === areaId).counties.map((county) => county.county).join(',');
        }
        if (marketArea.includes('county')) {
            const countyId = parseInt(marketArea.split('-')[1]);
            return this.props.counties.find((county) => county.id === countyId).county
        }
        return 'N/A'
    }

    onFocusChange(field) {
        return ({focused}) => {
            this.setState({
                [field]: focused
            })
        }
    }

    renderPropertyRatingFields() {
        const locationFields = {
            'roadFrontage': 'Road Frontage',
            accessFrontageEasement: 'Access Frontage or Easement',
            accessIngressEgressQuality: 'Access Ingress & Egress Quality',
            contiguousParcels: 'Contiguous Parcels'
        };
        const siteFields = {
            topography: 'Topography',
            soils: 'Soils',
            drainage: 'Drainage'
        };

        const {parameters} = this.props;
        const {additionalField1, additionalField2, additionalField3} = parameters;
        const additionalFields = {
            additionalField1: additionalField1, //Irrigation
            additionalField2: additionalField2,// Rivers, Creeks, Ponds
            additionalField3: additionalField3 // Marketable Timber
        };
        const locationRows = [<tr className="table-section-header">
            <td className="td header">Location</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>]
            .concat(Object.keys(locationFields).map((locationField) => {
                return (
                    <tr key={locationField}>
                        <td className="property-rating-td-padding label-2">{locationFields[locationField]}</td>
                        <td className="property-rating-td-padding label-2"><input type="checkbox" id={locationField+ '-na'} disabled/><label
                            htmlFor={locationField+ '-na'}/></td>
                        <td className="property-rating-td-padding label-2">

                            <input id={locationField + '-inferiorHigh'} checked={parameters[locationField] === 0}
                                   onChange={() => this.props.onParametersChange(locationField)({target: {value: 0}})}
                                   type="checkbox"/>
                            <label htmlFor={locationField + '-inferiorHigh'}/>
                        </td>
                        <td className="property-rating-td-padding label-2">

                            <input id={locationField + '-inferiorMod'} checked={parameters[locationField] === 2}
                                   onChange={() => this.props.onParametersChange(locationField)({target: {value: 2}})}
                                   type="checkbox"/>
                            <label htmlFor={locationField + '-inferiorMod'}/>
                        </td>
                        <td className="property-rating-td-padding label-2">

                            <input id={locationField + '-inferiorLow'} checked={parameters[locationField] === 4}
                                   onChange={() => this.props.onParametersChange(locationField)({target: {value: 4}})}
                                   type="checkbox"/>
                            <label htmlFor={locationField + '-inferiorLow'}/>
                        </td>
                        <td className="property-rating-td-padding label-2">

                            <input id={locationField + '-neutral'}
                                   checked={parameters[locationField] === 5 || parameters[locationField] == null}
                                   onChange={() => this.props.onParametersChange(locationField)({target: {value: 5}})}
                                   type="checkbox"/>
                            <label htmlFor={locationField + '-neutral'}/>
                        </td>
                        <td className="property-rating-td-padding label-2">

                            <input id={locationField + '-superiorLow'} checked={parameters[locationField] === 6}
                                   onChange={() => this.props.onParametersChange(locationField)({target: {value: 6}})}
                                   type="checkbox"/>
                            <label htmlFor={locationField + '-superiorLow'}/>
                        </td>
                        <td className="property-rating-td-padding label-2">

                            <input id={locationField + '-superiorMod'} checked={parameters[locationField] === 8}
                                   onChange={() => this.props.onParametersChange(locationField)({target: {value: 8}})}
                                   type="checkbox"/>
                            <label htmlFor={locationField + '-superiorMod'}/>
                        </td>
                        <td className="property-rating-td-padding label-2">

                            <input id={locationField + '-superiorHigh'} checked={parameters[locationField] === 10}
                                   onChange={() => this.props.onParametersChange(locationField)({target: {value: 10}})}
                                   type="checkbox"/>
                            <label htmlFor={locationField + '-superiorHigh'}/>
                        </td>
                    </tr>
                );
            }));

        const siteRows = [<tr className="table-section-header">
            <td className="td header">Site</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>]
            .concat(Object.keys(siteFields).map((siteField) => {
                return (
                    <tr key={siteField}>
                        <td className="property-rating-td-padding label-2">{siteFields[siteField]}</td>
                        <td className="property-rating-td-padding label-2"><input id={siteField+ '-na'} disabled type="checkbox"/><label htmlFor={siteField+ '-na'}/>
                        </td>
                        <td className="property-rating-td-padding label-2">

                            <input id={siteField + '-inferiorHigh'} checked={parameters[siteField] === 0}
                                   onChange={() => this.props.onParametersChange(siteField)({target: {value: 0}})}
                                   type="checkbox"/>
                            <label htmlFor={siteField + '-inferiorHigh'}/>
                        </td>
                        <td className="property-rating-td-padding label-2">

                            <input id={siteField + '-inferiorMod'} checked={parameters[siteField] === 2}
                                   onChange={() => this.props.onParametersChange(siteField)({target: {value: 2}})}
                                   type="checkbox"/>
                            <label htmlFor={siteField + '-inferiorMod'}/>
                        </td>
                        <td className="property-rating-td-padding label-2">

                            <input id={siteField + '-inferiorLow'} checked={parameters[siteField] === 4}
                                   onChange={() => this.props.onParametersChange(siteField)({target: {value: 4}})}
                                   type="checkbox"/>
                            <label htmlFor={siteField + '-inferiorLow'}/>
                        </td>
                        <td className="property-rating-td-padding label-2">

                            <input id={siteField + '-neutral'}
                                   checked={parameters[siteField] === 5 || parameters[siteField] == null}
                                   onChange={() => this.props.onParametersChange(siteField)({target: {value: 5}})}
                                   type="checkbox"/>
                            <label htmlFor={siteField + '-neutral'}/>
                        </td>
                        <td className="property-rating-td-padding label-2">

                            <input id={siteField + '-superiorLow'} checked={parameters[siteField] === 6}
                                   onChange={() => this.props.onParametersChange(siteField)({target: {value: 6}})}
                                   type="checkbox"/>
                            <label htmlFor={siteField + '-superiorLow'}/>
                        </td>
                        <td className="property-rating-td-padding label-2">

                            <input id={siteField + '-superiorMod'} checked={parameters[siteField] === 8}
                                   onChange={() => this.props.onParametersChange(siteField)({target: {value: 8}})}
                                   type="checkbox"/>
                            <label htmlFor={siteField + '-superiorMod'}/>
                        </td>
                        <td className="property-rating-td-padding label-2">

                            <input id={siteField + '-superiorHigh'} checked={parameters[siteField] === 10}
                                   onChange={() => this.props.onParametersChange(siteField)({target: {value: 10}})}
                                   type="checkbox"/>
                            <label htmlFor={siteField + '-superiorHigh'}/>
                        </td>
                    </tr>
                );
            }));

        const additionalRows = [<tr className="table-section-header">
            <td className="td header">Additional Features</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>]
            .concat(Object.keys(additionalFields).map((additionalField) => {
                const fieldObj = additionalFields[additionalField];
                return (
                    <tr key={additionalField}>
                        <td className="additional-fields-row" style={{paddingRight: '40px'}}>
                            <input id={additionalField} value={fieldObj['fieldName']} type="text"
                                   placeholder={fieldObj['placeholder']}
                                   onChange={this.props.onParametersChange(additionalField + '-fieldName')} className="property-rating-params-input eval-input w-input"/></td>
                        <td className="additional-fields-row">

                            <input id={additionalField+ '-na'} checked={fieldObj['value'] == null}
                                   onChange={() => this.props.onParametersChange(additionalField)({target: {value: null}})}
                                   type="checkbox"/>
                            <label htmlFor={additionalField+ '-na'}/>
                        </td>
                        <td className="additional-fields-row">

                            <input id={additionalField + '-inferiorHigh'} checked={fieldObj['value'] === 0}
                                   onChange={() => this.props.onParametersChange(additionalField)({target: {value: 0}})}
                                   type="checkbox"/>
                            <label htmlFor={additionalField + '-inferiorHigh'}/>
                        </td>
                        <td className="additional-fields-row">

                            <input id={additionalField + '-inferiorMod'} checked={fieldObj['value'] === 2}
                                   onChange={() => this.props.onParametersChange(additionalField)({target: {value: 2}})}
                                   type="checkbox"/>
                            <label htmlFor={additionalField + '-inferiorMod'}/>
                        </td>
                        <td className="additional-fields-row">

                            <input id={additionalField + '-inferiorLow'} checked={fieldObj['value'] === 4}
                                   onChange={() => this.props.onParametersChange(additionalField)({target: {value: 4}})}
                                   type="checkbox"/>
                            <label htmlFor={additionalField + '-inferiorLow'}/>
                        </td>
                        <td className="additional-fields-row">

                            <input id={additionalField + '-neutral'} checked={fieldObj['value'] === 5}
                                   onChange={() => this.props.onParametersChange(additionalField)({target: {value: 5}})}
                                   type="checkbox"/>
                            <label htmlFor={additionalField + '-neutral'}/>
                        </td>
                        <td className="additional-fields-row">

                            <input id={additionalField + '-superiorLow'} checked={fieldObj['value'] === 6}
                                   onChange={() => this.props.onParametersChange(additionalField)({target: {value: 6}})}
                                   type="checkbox"/>
                            <label htmlFor={additionalField + '-superiorLow'}/>
                        </td>
                        <td className="additional-fields-row">

                            <input id={additionalField + '-superiorMod'} checked={fieldObj['value'] === 8}
                                   onChange={() => this.props.onParametersChange(additionalField)({target: {value: 8}})}
                                   type="checkbox"/>
                            <label htmlFor={additionalField + '-superiorMod'}/>
                        </td>
                        <td className="additional-fields-row">

                            <input id={additionalField + '-superiorHigh'} checked={fieldObj['value'] === 10}
                                   onChange={() => this.props.onParametersChange(additionalField)({target: {value: 10}})}
                                   type="checkbox"/>
                            <label htmlFor={additionalField + '-superiorHigh'}/>
                        </td>
                    </tr>
                );
            }));

        return locationRows.concat(siteRows).concat(additionalRows);
    }

    renderImagePreview(picObj){
      if(picObj.isProcessing){
        return (
            <div className="progress">
                <div className="indeterminate"></div>
            </div>
        );
      }
      else if (picObj.fileURI != null) {
        return (
          <div className="col s12">
              <img src={picObj.fileURI} className="responsive-img"/>
          </div>
        );
      }
      else {
        return <h4 className="grey-text text-lighten-3">Image Preview</h4>;
      }
    }

    renderPDFImages(){
      const {pdfImages} = this.props;

      return (
        <div className="row">
        <div>
          <div className="row">
            <h1 className="e-value-text-green">PDF Images:</h1>
          </div>
          <div className="row">
            <div className="row">
              <h3 className="rating-subheader">Property Pictures</h3>
            </div>
            {pdfImages.propertyPictures.map((pic, index) => {
              return (
                <div className="row">
                  <div className="col s6">
                    <div className="file-field input-field">
                        <div className="row">
                            <div className="submit-button inverse upload w-button" >CHOOSE FILE...</div>
                            <input className="submit-button inverse upload w-button" type="file" id="file-uploader" onChange={this.props.onPDFImagesChange('propertyPictures', index)}/>
                        </div>
                        <div >
                            {/* { pic.fileURI != null ?
                                <i onClick={this.props.clearPDFImages('propertyPictures', index)} className="material-icons prefix blue-grey-text"
                                   style={{paddingTop: '1%', cursor: 'pointer'}}>cancel</i>
                                : null} */}

                            {/* <input value={pic.file == null ? pic.fileURI != null ? 'property pic ' + (index + 1) : '' : pic.file.name} className="eval-input" type="text" placeholder="Optional"/> */}

                        </div>
                      </div>
                        <textarea placeholder="Optional"
                                className="materialize-textarea eval-input" />
                  </div>
                  <div className="col s6">
                    {this.renderImagePreview(pic)}
                  </div>
                </div>
              );
            })}
            <div className="row">
              <h3 className="rating-subheader">Signature</h3>
            </div>
            <div className="row">
              <div className="col s6">
                <div className="file-field input-field">
                  <div className="row">
                      <div className="submit-button inverse upload w-button" >CHOOSE FILE...</div>
                      <input type="file" id="file-uploader" onChange={this.props.onPDFImagesChange('signature')}/>
                  </div>
                  <div className="row">
                      {/* { pdfImages.signature.fileURI != null ?
                          <i onClick={this.props.clearPDFImages('signature')} className="material-icons prefix blue-grey-text"
                             style={{paddingTop: '1%', cursor: 'pointer'}}>cancel</i>
                          : null} */}

                      {/* <input value={pdfImages.signature.file == null ? pdfImages.signature.fileURI != null ? 'signature' : '' : pdfImages.signature.file.name} className="eval-input" type="text" placeholder="Optional"/> */}
                  </div>
                </div>
                <textarea placeholder="Optional"
                                className="materialize-textarea eval-input" />
              </div>
              <div className="col s6">
                {this.renderImagePreview(pdfImages.signature)}
              </div>
            </div>
            <div className="row">
              {/* <h4 className="e-value-text-green">Additional Pictures
              <i className="material-icons blue-text tooltipped" data-delay="50" data-position="right"
              data-tooltip="These pictures are optional. Every picture you upload in this section gets added to its own page with the Page Header being what you set in the Page Name field">
              info_outline</i></h4> */}
                <h3 className="rating-subheader">Additional Pictures</h3>
            </div>
            {pdfImages.additionalExhibits.map((pic, index) => {
              return (
                <div className="row">
                  {/* <div className="col s4">
                    <div className="input-field">
                      <input value={pic.pageName} onChange={this.props.additionalExhibitsNameChange(index)} id={`additional-exhibit-${index}`} type="text" placeholder=""/>
                      <label className="active" htmlFor={`additional-exhibit-${index}`}>Page Name</label>
                    </div>
                  </div> */}
                  <div className="col s6">
                    <div className="file-field input-field">
                        <div className="row">
                            <div className="submit-button inverse upload w-button" >CHOOSE FILE...</div>
                            <input type="file" id="file-uploader" onChange={this.props.onPDFImagesChange('additionalExhibits', index)}/>
                        </div>
                        {/* <div className="row">
                            { pic.fileURI != null ?
                                <i onClick={this.props.clearPDFImages('additionalExhibits', index)} className="material-icons prefix blue-grey-text"
                                   style={{paddingTop: '1%', cursor: 'pointer'}}>cancel</i>
                                : null}
                            <input value={pic.file == null ? pic.fileURI != null ? 'additional pic ' + (index +1) : ''  : pic.file.name} className="eval-input" type="text" placeholder="Optional"/>
                        </div> */}
                      </div>
                      <textarea placeholder="Optional"
                                className="materialize-textarea eval-input" />
                  </div>
                  <div className="col s6">
                    {this.renderImagePreview(pic)}
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        </div>
      );
    }

    render() {
        const {parameters, propertyRatingParams, farmableFactor, nonfarmableFactor, irrigationFactor} = this.props;
        const {tillableFactor, unTillableFactor, irrigationFactorResult, tillableResult, blendedResult, grossPotentialAverage,
            totalSubjectScore, percentageAboveBelow, reconciledOverallRating} = propertyRatingParams;
        return (
          <MuiThemeProvider>
              <div className="div-block-10">

            <div className="div-block-23">
                {/* <div className="row">
                    <h1 className="e-value-text-yellow">Evaluation Parameters:</h1>
                </div>
                <div className="divider"></div> */}

                <div className="row" id="site-summary">
                    {/* <div className="row">
                        <h2 className="e-value-text-green">
                            Site Summary:
                        </h2>
                    </div> */}
                    {/**Site Summary Fields**/}
                    {/* <div className="row col s12 input-field">
                        <label htmlFor="orgName" className="active">Branch</label>
                        <input placeholder="" id="orgName" type="text" value={this.props.orgName}
                               readOnly="true"/>

                    </div> */}
                    <div className="row">
                        <div className="w-col w-col-4">
                            <label htmlFor="orgName" className="eval-field-label">Branch</label>
                            <input placeholder="" id="orgName" type="text" 
                                className="eval-input w-input"/>

                        </div>
                        <div className="w-col w-col-4">
                            <label className="eval-field-label" htmlFor="address1">Branch Address</label>
                            <input placeholder="" id="address1" type="text" 
                                   className="eval-input w-input"/>

                        </div>
                        <div className="w-col w-col-4">
                            <label className="eval-field-label" htmlFor="city">City</label>
                            <input placeholder="" id="city" type="text"
                                   className="eval-input w-input"/>

                        </div>
                    </div>
                    <div className="row">
                        <div className="w-col w-col-4">
                            <label className="eval-field-label" htmlFor="state">State</label>
                            <input placeholder="" id="state" type="text" 
                                   className="eval-input w-input"/>

                        </div>
                        <div className="w-col w-col-4">
                            <label className="eval-field-label" htmlFor="postalCode">Zip Code</label>
                            <input placeholder="" id="postalCode"  type="text"
                                   className="eval-input w-input"/>
                        </div>
                        <div className="col s4 tooltipped" data-position="top" data-delay="50" data-tooltop="Date Sold">
                            <label className="eval-field-label" htmlFor="evaluationdate">Evaluation Date</label>
                            <DatePicker  
                           className="eval-input w-input-select"
                            value={parameters.dateSold == null ? null : parameters.dateSold.toDate()}
                            onChange={(event, value) => this.props.onParametersChange('dateSold')({target: {value}})}
                            hintText="Date Sold" openToYearSelection={true}
                            />
                        </div>
                    </div>
                    <div className="row">

                        <div className="w-col w-col-4">
                        <label className="eval-field-label" htmlFor="evalAreaName">Market Area</label>
                        <select className="eval-input w-input-select" 
                              value={parameters.marketArea == null || parameters.marketArea == '' ? 'entireMarketArea' : parameters.marketArea}
                              defaultValue={parameters.marketArea == null || parameters.marketArea == '' ? 'entireMarketArea' : parameters.marketArea}
                              onChange={this.props.onParametersChange('marketArea')}>
                              <option value="entireMarketArea" className="tooltipped" data-position="right"
                                      data-delay="50"
                                      data-tooltip={this.props.counties.map((county) => county.county).join(', ')}>
                                  Entire Market Area
                              </option>
                              {this.renderMarketArea()}
                        </select>
                        <div className="col s6 valign">
                            <span
                                style={{wordWrap: 'break-word', fontSize: '1.25rem'}}>{this.renderMarketAreaInfo()}</span>
                        </div>
                        {/* <div className="row valign-wrapper">
                        <Input 
                            value={parameters.marketArea == null || parameters.marketArea == '' ? 'entireMarketArea' : parameters.marketArea}
                            defaultValue={parameters.marketArea == null || parameters.marketArea == '' ? 'entireMarketArea' : parameters.marketArea}
                            onChange={this.props.onParametersChange('marketArea')}>
                            <option value="entireMarketArea" className="tooltipped" data-position="right"
                                    data-delay="50"
                                    data-tooltip={this.props.counties.map((county) => county.county).join(', ')}>
                                Entire Market Area
                            </option>
                            {this.renderMarketArea()}
                        </Input>
                        <div className="col s6 valign">
                            <span
                                style={{wordWrap: 'break-word', fontSize: '1.25rem'}}>{this.renderMarketAreaInfo()}</span>
                        </div>
                        </div>  */}
                        </div>


                        <div className="w-col w-col-4">
                            <label className="eval-field-label" htmlFor="evalName">Evaluation Name</label>
                            <input className="eval-input w-input" data-delay="50" data-position="bottom"
                            data-tooltip="The parcel number is automatically included in the name. If left blank then, the name will be the parcel number followed by the address"
                             id="evalName" placeholder=""
                             value={parameters.name == null ? '' : parameters.name} type="text" onChange={this.props.onParametersChange('name')}/>
                        </div>





                    </div>


                    {/* <div className="row">
                        <div className="col s6 ">
                            <div className="col s7 toggle-label">
                                <p>Current Listing:</p>
                            </div>
                            <div className="col s5 toggle">
                                <div className="switch">
                                    <label>
                                        No
                                        <input type="checkbox"
                                               onChange={this.props.onParametersChange('currentListing')}
                                               checked={parameters.currentListing} disabled={false}/>
                                        <span className="lever"/>
                                        Yes
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="col s6">
                            <i className="material-icons prefix">attach_money</i>
                            <label htmlFor="salePrice" className="active">Current Listing Price</label>
                            <input type="number" value={parameters.currentListingPrice == null ? 0.00 : parameters.currentListingPrice}
                                   step="500" onChange={this.props.onParametersChange('currentListingPrice')}
                                   className="tooltipped"
                                   data-position="top"
                                   data-delay="50"
                                   data-tooltip="If currently listed, the listing price" id="currentListingPrice" placeholder="" disabled={!parameters.currentListing}/>
                        </div>
                    </div> */}
                    {/* <div className="row">
                        <div className="col s6  ">
                            <div className="col s7 toggle-label">
                                <p>Property Sold Last 3 years?:</p>
                            </div>
                            <div className="col s5 toggle">
                                <div className="switch">
                                    <label>
                                        No
                                        <input type="checkbox"
                                               onChange={this.props.onParametersChange('propertySoldLastThreeYears')}
                                               checked={parameters.propertySoldLastThreeYears}/>
                                        <span className="lever"/>
                                        Yes
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="col s6 input-field">
                            <i className="material-icons prefix">attach_money</i>
                            <label htmlFor="salePrice" className="active">Amount of Sale Price</label>
                            <input type="number" value={parameters.salePrice == null ? 0.00 : parameters.salePrice}
                                   step="500" onChange={this.props.onParametersChange('salePrice')}
                                   className="tooltipped"
                                   data-position="top"
                                   data-delay="50"
                                   data-tooltip="If sold in last three years." id="salePrice" placeholder="" disabled={!parameters.propertySoldLastThreeYears}/>
                        </div>
                    </div> */}
                    {/* <div className="row">
                        <div className="col s6 tooltipped" data-position="top" data-delay="50" data-tooltop="Date Sold">
                            <DatePicker
                            value={parameters.dateSold == null ? null : parameters.dateSold.toDate()}
                            onChange={(event, value) => this.props.onParametersChange('dateSold')({target: {value}})}
                            hintText="Date Sold" openToYearSelection={true}/>
                        </div>
                        { <div className="col s6 input-field">
                            <label htmlFor="currentUse" className="active">Current Use</label>
                            <input id="currentUse" type="text"
                                   value={parameters.currentUse == null ? '' : parameters.currentUse}
                                   onChange={this.props.onParametersChange('currentUse')} placeholder=""/>
                        </div> }
                    </div> */}
                    {/* <div className="row">
                        <div className="col s6 input-field">
                            <label htmlFor="highestAndBestUse" className="active">Highest and Best Use</label>
                            <input id="highestAndBestUse" type="text"
                                   value={parameters.highestAndBestUse == null ? '' : parameters.highestAndBestUse}
                                   onChange={this.props.onParametersChange('highestAndBestUse')} placeholder=""/>
                        </div>
                        <div className="col s6 input-field">
                            <label htmlFor="marketingExposureTime" className="active">Marketing/Exposure Time</label>
                            <input id="marketingExposureTime" type="text"
                                   value={parameters.marketingExposureTime == null ? '' : parameters.marketingExposureTime}
                                   onChange={this.props.onParametersChange('marketingExposureTime')} placeholder=""/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col s6 input-field">
                             <i className="material-icons prefix">attach_money</i>
                            <label htmlFor="landAssessment" className="active">Land Assessment (tax assessor)</label>
                            <input id="landAssessment" type="number" step="500"
                                   value={parameters.landAssessmentTaxAssessor == null ? 0.00 : parameters.landAssessmentTaxAssessor}
                                   onChange={this.props.onParametersChange('landAssessmentTaxAssessor')} placeholder=""/>
                        </div>
                        <div className="col s6 input-field">
                            <i className="material-icons prefix">attach_money</i>
                            <label htmlFor="buildingAssessment" className="active">Building Assessment (tax assessor)</label>
                            <input id="buildingAssessment" type="number" step="500"
                                   value={parameters.buildingAssessmentTaxAssessor == null ? 0.00 : parameters.buildingAssessmentTaxAssessor}
                                   onChange={this.props.onParametersChange('buildingAssessmentTaxAssessor')} placeholder=""/>
                        </div>
                    </div> */}
                    {/* <div className="row">
                        <div className="col s12 input-field">
                            <input type="text" id="ownerBorrower"
                                   value={parameters.ownerBorrower == null ? '' : parameters.ownerBorrower}
                                   onChange={this.props.onParametersChange('ownerBorrower')} placeholder=""/>
                            <label htmlFor="ownerBorrower" className="active">Owner or Borrower</label>
                        </div>
                    </div> */}

                    <div className="row">
                    <div className="w-col w-col-4">
                            <label htmlFor="ownerBorrower" className="eval-field-label">Owner or Borrower</label>
                            <input type="text" id="ownerBorrower" className="eval-input w-input"
                                   value={parameters.ownerBorrower == null ? '' : parameters.ownerBorrower}
                                   onChange={this.props.onParametersChange('ownerBorrower')} placeholder=""/>
                        </div>
                        <div className="w-col w-col-4">
                            <label htmlFor="propertyAddress" className="eval-field-label">Property Address</label>
                            <input id="propertyAddress" type="text" className="eval-input w-input"
                                   value={parameters.propertyAddress == null ? '' : parameters.propertyAddress}
                                   onChange={this.props.onParametersChange('propertyAddress')} placeholder=""/>
                        </div>
                        <div className="w-col w-col-4">
                            <label htmlFor="propertyCity" className="eval-field-label">Property City</label>
                            <input id="propertyCity" type="text" className="eval-input w-input"
                                   value={parameters.propertyCity == null ? '' : parameters.propertyCity}
                                   onChange={this.props.onParametersChange('propertyCity')} placeholder=""/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="w-col w-col-4">
                            <label htmlFor="propertyState" className="eval-field-label">Property State</label>
                            <input type="text" id="propertyState" className="eval-input w-input"
                                   value={parameters.propertyState == null ? '' : parameters.propertyState}
                                   onChange={this.props.onParametersChange('propertyState')} placeholder=""/>
                        </div>
                        <div className="w-col w-col-4">
                            <label htmlFor="propertyPostalCode" className="eval-field-label">Property Zip Code</label>
                            <input type="text" id="propertyPostalCode" className="eval-input w-input"
                                   value={parameters.propertyPostalCode == null ? '' : parameters.propertyPostalCode}
                                   onChange={this.props.onParametersChange('propertyPostalCode')} placeholder=""/>
                        </div>
                        <div className="w-col w-col-4">
                            <label htmlFor="propertyCountry" className="eval-field-label">Property Country</label>
                            <input type="text" id="propertyCountry"  className="eval-input w-input"
                                   value={parameters.propertyCountry == null ? '' : parameters.propertyCountry}
                                   onChange={this.props.onParametersChange('propertyCountry')} placeholder=""/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="w-col w-col-4">
                            <label htmlFor="mapParcelNumber" className="eval-field-label">Map & Parcel #</label>
                            <input id="mapParcelNumber" type="text" className="eval-input w-input"
                                   value={parameters.mapParcelNumber == null ? '' : parameters.mapParcelNumber}
                                   onChange={this.props.onParametersChange('mapParcelNumber')} placeholder=""/>
                        </div>
                    </div>







                    <div className="row">
                        <div className="w-col w-col-6">
                            <label htmlFor="salePrice" className="eval-field-label">Is this property currently listed for scale?</label>
                            <div className="switch">
                                    <label>
                                        No
                                        <input type="checkbox"
                                               onChange={this.props.onParametersChange('currentListing')}
                                               checked={parameters.currentListing} disabled={false}/>
                                        <span className="lever"/>
                                        Yes
                                    </label>
                                </div>
                        </div>
                        <div className="w-col w-col-6">
                            <label htmlFor="salePrice" className="eval-field-label">Current Listing Price</label>
                            <input type="number" value={parameters.currentListingPrice == null ? 0.00 : parameters.currentListingPrice}
                                   step="500" onChange={this.props.onParametersChange('currentListingPrice')}
                                   className="eval-input w-input"
                                   data-position="top"
                                   data-delay="50"
                                   data-tooltip="If currently listed, the listing price" id="currentListingPrice" placeholder="" disabled={!parameters.currentListing}/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="w-col w-col-6">
                            <label htmlFor="salePrice" className="eval-field-label">Property Sold Last 3 years?</label>
                            <div className="switch">
                                    <label>
                                        No
                                        <input type="checkbox"
                                               onChange={this.props.onParametersChange('propertySoldLastThreeYears')}
                                               checked={parameters.propertySoldLastThreeYears}/>
                                        <span className="lever"/>
                                        Yes
                                    </label>
                            </div>
                        </div>
                        <div className="w-col w-col-6">
                            <label htmlFor="salePrice" className="eval-field-label">Amount of Sale Price</label>
                            <input type="number" value={parameters.salePrice == null ? 0.00 : parameters.salePrice}
                                   step="500" onChange={this.props.onParametersChange('salePrice')}
                                   className="eval-input w-input"
                                   data-position="top"
                                   data-delay="50"
                                   data-tooltip="If sold in last three years." id="salePrice" placeholder="" disabled={!parameters.propertySoldLastThreeYears}/>
                        </div>
                    </div>
                    <div className="row">
                    <div className="w-col w-col-6">
                        <label htmlFor="salePrice" className="eval-field-label">Physically Inspected</label>
                        <div className="switch">
                                <label>
                                    No
                                    <input type="checkbox"
                                           onChange={this.props.onParametersChange('didYouPhysicallyInspectProperty')}
                                           checked={parameters.didYouPhysicallyInspectProperty}/>
                                    <span className="lever"/>
                                    Yes
                                </label>
                        </div>
                        </div>

                        <div className="w-col w-col-6">
                            <label htmlFor="propertyRights" className="eval-field-label">Property Rights</label>
                            <input id="propertyRights" type="text" className="eval-input w-input"
                                   value={parameters.propertyRights == null ? '' : parameters.propertyRights}
                                   onChange={this.props.onParametersChange('propertyRights')} placeholder=""/>
                        </div>
                    </div>





                    <div className="row">
                     <div className="w-col w-col-6">
                        <label htmlFor="currentUse" className="eval-field-label">Current Use</label>
                        <select className="eval-input w-input-select" id="currentUse"
                               value={parameters.currentUse == null ? '' : parameters.currentUse}
                               onChange={this.props.onParametersChange('currentUse')} s={10}>
                            <option value="0">Select one</option>
                            <option value="1">Permanent planning</option>
                            <option value="2">Row </option>
                            <option value="3">Crop</option>
                            <option value="4">Timber</option>
                            <option value="5">Other</option>
                        </select>

                        </div> 

                        <div className="w-col w-col-6">
                        <label htmlFor="highestAndBestUse" className="eval-field-label">Highest and Best Use</label>                     
                        <select className="eval-input w-input-select" id="highestAndBestUse"
                               value={parameters.highestAndBestUse == null ? '' : parameters.highestAndBestUse}
                               onChange={this.props.onParametersChange('highestAndBestUse')} s={10}>
                            <option value="0">Select one</option>
                            <option value="1">Permanent planning</option>
                            <option value="2">Row </option>
                            <option value="3">Crop</option>
                            <option value="4">Timber</option>
                            <option value="5">Other</option>
                        </select>
                        </div>

                    </div>
                    <div className="row">
                    <div className="w-col w-col-6">
                            <label htmlFor="landAssessment" className="eval-field-label">Land Assessment (tax assessor)</label>
                            <input id="landAssessment" type="number" step="500" className="eval-input w-input"
                                   value={parameters.landAssessmentTaxAssessor == null ? 0.00 : parameters.landAssessmentTaxAssessor}
                                   onChange={this.props.onParametersChange('landAssessmentTaxAssessor')} placeholder=""/>
                        </div>
                        <div className="w-col w-col-6">
                            <label htmlFor="buildingAssessment" className="eval-field-label">Building Assessment (tax assessor)</label>
                            <input id="buildingAssessment" type="number" step="500" className="eval-input w-input"
                                   value={parameters.buildingAssessmentTaxAssessor == null ? 0.00 : parameters.buildingAssessmentTaxAssessor}
                                   onChange={this.props.onParametersChange('buildingAssessmentTaxAssessor')} placeholder=""/>
                        </div>
                    </div>





                    <div className="row">
                        <div className="w-col w-col-6">
                        <label htmlFor="zoning" className="eval-field-label">Zoning</label>
                        <select className="eval-input w-input-select" id="z"
                               value={parameters.zoning == null ? '' : parameters.zoning}
                               onChange={this.props.onParametersChange('zoning')} s={10}>
                            <option value="0">Select one</option>
                            <option value="1">Permanent planning</option>
                            <option value="2">Row </option>
                            <option value="3">Crop</option>
                            <option value="4">Timber</option>
                            <option value="5">Other</option>
                        </select>
                        </div>
                        <div className="w-col w-col-6">
                        <label htmlFor="propertyType" className="eval-field-label">Property Type</label>
                        <select className="eval-input w-input-select" id="propertyType"
                             value={parameters.propertyType == null ? '' : parameters.propertyType}
                             onChange={this.props.onParametersChange('propertyType')} s={10}>
                            <option value="0">Select one</option>
                            <option value="1">Permanent planning</option>
                            <option value="2">Row </option>
                            <option value="3">Crop</option>
                            <option value="4">Timber</option>
                            <option value="5">Other</option>
                        </select>
                        </div>

                    </div>
                    <div className="row">
                     <div className="w-col w-col-5">
                            <label htmlFor="utilities" className="eval-field-label">Water</label>
                            <input id="utilities" type="text" className="eval-input w-input"
                                   value={parameters.utilities == null ? '' : parameters.utilities}
                                   onChange={this.props.onParametersChange('utilities')}
                                   placeholder="Public"/>
                        </div> 
                        <div className="w-col w-col-5">
                            <label htmlFor="sewer" className="eval-field-label">Sewer</label>
                            <input id="sewer" type="text" className="eval-input w-input"
                                   value={parameters.sewer == null ? '' : parameters.sewer}     
                                   onChange={this.props.onParametersChange('sewer')}
                                   placeholder="Public"/>
                        </div> 
                        <div className="w-col w-col-5">
                            <label htmlFor="gas" className="eval-field-label">Gas</label>
                            <input id="gas" type="text" className="eval-input w-input"
                                   value={parameters.gas == null ? '' : parameters.gas}     
                                   onChange={this.props.onParametersChange('gas')}
                                   placeholder="Public"/>
                        </div> 
                        <div className="w-col w-col-5">
                            <label htmlFor="power" className="eval-field-label">Power</label>
                            <input id="power" type="text" className="eval-input w-input"
                                   value={parameters.power == null ? '' : parameters.power}     
                                   onChange={this.props.onParametersChange('power')}
                                   placeholder="Public"/>
                        </div> 



                    </div>

                    <div className="row">
                        <div className="w-col w-col-4">
                            <label htmlFor="acres" className="eval-field-label">Acres</label>
                            <input id="acres" type="number" step="50" className="eval-input w-input"
                                    value={parameters.acres}
                                    onChange={this.props.onParametersChange('acres')} placeholder=""/>
                        </div>                        
                        <div className="w-col w-col-4">
                            <label htmlFor="tillableSecond" className="eval-field-label">Farmable (Percentage)</label>
                            <input id="tillableSecond" type="number" value={parameters.tillable} step="50.0" className="eval-input w-input"
                                    onChange={this.props.onParametersChange('tillable')} min="0.00" max="100.00"
                                    placeholder=""/>
                        </div>
                        <div className="w-col w-col-4">
                            <label htmlFor="unTillableFirst" className="eval-field-label">Non-Farmable (Percentage)</label>
                            <input id="unTillableFirst" type="number" value={parameters.unTillable} step="1" className="eval-input w-input"
                                    onChange={this.props.onParametersChange('unTillable')} min="0.00" max="100.00"
                                    placeholder=""/>
                        </div>
                    </div>



                    {/* <div className="row">
                        <div className="col s12 input-field">
                            <input id="mapParcelNumber" type="text"
                                   value={parameters.mapParcelNumber == null ? '' : parameters.mapParcelNumber}
                                   onChange={this.props.onParametersChange('mapParcelNumber')} placeholder=""/>
                            <label htmlFor="mapParcelNumber" className="active">Map & Parcel #</label>
                        </div>
                    </div> */}

                    {/* <div className="row">
                        <div className="col s6">
                            <div className="col s7 toggle-label">
                                <p>Legal and Physical Access:</p>
                            </div>
                            <div className="col s5 toggle">
                                <div className="switch">
                                    <label>
                                        No
                                        <input type="checkbox"
                                               onChange={this.props.onParametersChange('legalPhysicalAccess')}
                                               checked={parameters.legalPhysicalAccess}/>
                                        <span className="lever"/>
                                        Yes
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="col s6 input-field">
                            <input id="zoning" type="text"
                                   value={parameters.zoning == null ? '' : parameters.zoning}
                                   onChange={this.props.onParametersChange('zoning')} placeholder="Agricultural"/>
                            <label htmlFor="zoning" className="active">Zoning</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col s6 input-field">
                            <input id="utilities" type="text"
                                   value={parameters.utilities == null ? '' : parameters.utilities}
                                   onChange={this.props.onParametersChange('utilities')}
                                   placeholder="Public/Public/Public"/>
                            <label htmlFor="utilities" className="active">Utilities - Water/Sewer/Gas</label>
                        </div>
                        <div className="col s6 input-field">
                            <input id="propertyRights" type="text"
                                   value={parameters.propertyRights == null ? '' : parameters.propertyRights}
                                   onChange={this.props.onParametersChange('propertyRights')} placeholder=""/>
                            <label htmlFor="propertyRights" className="active">Property Rights</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col s6 input-field">
                            <input id="propertyType" type="text" value="Agricultural Land" placeholder="" readOnly/>
                            <label htmlFor="propertyType" className="active">Property Type</label>
                        </div>
                        <div className="col s6">
                          <div className="col s7 toggle-lable">
                            <p>Did you physically inspect the subject property(ies)?:</p>
                          </div>
                          <div className="col s5 toggle">
                            <div className="switch">
                                <label>
                                    No
                                    <input type="checkbox"
                                           onChange={this.props.onParametersChange('didYouPhysicallyInspectProperty')}
                                           checked={parameters.didYouPhysicallyInspectProperty}/>
                                    <span className="lever"/>
                                    Yes
                                </label>
                            </div>
                          </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col s4 input-field">
                            <input id="tillableFirst" type="number" value={parameters.tillable} step="1"
                                   onChange={this.props.onParametersChange('tillable')} min="0.00" max="100.00"
                                   placeholder=""/>
                            <label htmlFor="tillableFirst" className="active">Farmable (Percentage)</label>
                        </div>
                        <div className="col s4 input-field">
                            <input id="unTillableFirst" type="number" value={parameters.unTillable} step="1"
                                   onChange={this.props.onParametersChange('unTillable')} min="0.00" max="100.00"
                                   placeholder=""/>
                            <label htmlFor="unTillableFirst" className="active">Non-Farmable (Percentage)</label>
                        </div>
                        <div className="col s4 input-field">
                          <input id="irrigationPercentage" type="number" value={parameters.irrigationPercentage} step="10.0"
                                 onChange={this.props.onParametersChange('irrigationPercentage')} min="0.00" max="100.00"
                                 placeholder="" disabled={irrigationFactor === 0}/>
                          <label htmlFor="irrigationPercentage" className="active">Irrigation (Percentage)</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col s12 input-field">
                            <input id="acres" type="number" step="50"
                                   value={parameters.acres}
                                   onChange={this.props.onParametersChange('acres')} placeholder=""/>
                            <label htmlFor="acres" className="active">Acres</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col s6 input-field">
                            <input id="evaluator" type="text"
                                   value={parameters.evaluator == null ? '' : parameters.evaluator}
                                   onChange={this.props.onParametersChange('evaluator')} placeholder=""/>
                            <label htmlFor="evaluator" className="active">Evaluator</label>
                        </div>
                        <div className="col s6 tooltipped" data-position="top" data-delay="50"
                             data-tooltip="Date Of Inspection">
                             <DatePicker value={parameters.dateOfInspection == null ? null : parameters.dateOfInspection.toDate()}
                             onChange={(event, value) => this.props.onParametersChange('dateOfInspection')({target: {value}})}
                             hintText="Date Of Inspection" openToYearSelection={true}/>
                        </div>
                    </div>
                    <div className="row valign-wrapper">

                        <Input label="Market Area" type="select" s={6}
                               value={parameters.marketArea == null || parameters.marketArea == '' ? 'entireMarketArea' : parameters.marketArea}
                               defaultValue={parameters.marketArea == null || parameters.marketArea == '' ? 'entireMarketArea' : parameters.marketArea}
                               onChange={this.props.onParametersChange('marketArea')}>
                            <option value="entireMarketArea" className="tooltipped" data-position="right"
                                    data-delay="50"
                                    data-tooltip={this.props.counties.map((county) => county.county).join(', ')}>
                                Entire Market Area
                            </option>
                            {this.renderMarketArea()}
                        </Input>
                        <div className="col s6 valign">
                            <span
                                style={{wordWrap: 'break-word', fontSize: '1.25rem'}}>{this.renderMarketAreaInfo()}</span>
                        </div>
                    </div> */}
                </div>

                <div className="row">
                    <h1 className="e-value-text-green">Property Rating:</h1>
                </div>
                <div className="row" id="property-rating-1">
                    {/**Property Rating**/}
                    <div className="row">
                        <table>
                            <thead>
                            <tr>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th className="label-2">Inferior</th>
                                <th></th>
                                <th className="label-2">Typical</th>
                                <th></th>
                                <th className="label-2">Superior</th>
                                <th></th>
                            </tr>
                            <tr>
                                <th></th>
                                <th className="label-2">N/A</th>
                                <th className="label-2">High</th>
                                <th className="label-2">Mod</th>
                                <th className="label-2">Low</th>
                                <th className="label-2">Neutral</th>
                                <th className="label-2">Low</th>
                                <th className="label-2">Mod</th>
                                <th className="label-2">High</th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.renderPropertyRatingFields()}
                            </tbody>
                        </table>
                    </div>
                    </div>
                {/* <div id="property-rating-2">
                    <div className="row">
                        <h4 className="e-value-text-green">Blended %</h4>
                    </div>
                    <div className="row">
                        <div className="col s4 input-field">
                            <label htmlFor="tillableSecond" className="active">Farmable (Percentage)</label>
                            <input id="tillableSecond" type="number" value={parameters.tillable} step="50.0"
                                   onChange={this.props.onParametersChange('tillable')} min="0.00" max="100.00"
                                   placeholder=""/>
                            
                        </div>
                        <div className="col s4 input-field">
                            <label htmlFor="unTillableSecond" className="active">Non-Farmable (Percentage)</label>
                            <input id="unTillableSecond" type="number" value={parameters.unTillable} step="50.0"
                                   onChange={this.props.onParametersChange('unTillable')} min="0.00" max="100.00"
                                   placeholder=""/>
                            
                        </div>
                        <div className="col s4 input-field">
                          <label htmlFor="irrigationPercentageSecond" className="active">Irrigation (Percentage)</label>
                          <input id="irrigationPercentageSecond" type="number" value={parameters.irrigationPercentage} step="10.0"
                                 onChange={this.props.onParametersChange('irrigationPercentage')} min="0.00" max="100.00"
                                 placeholder="" disabled={irrigationFactor === 0}/>
                          
                        </div>
                    </div>

                    <div className="row">
                        <div className="col s4">
                            <div className="col s6">
                                <p>Factor:</p>
                            </div>
                            <div className="col s6">
                                <p>{tillableFactor.toFixed(2)} {`  (${(parameters.tillable/100).toFixed(2)} * ${farmableFactor})`}</p>
                            </div>
                        </div>
                        <div className="col s4">
                            <div className="col s12">
                                <p>{unTillableFactor.toFixed(2)} {`  (${(parameters.unTillable/100).toFixed(2)} * ${nonfarmableFactor})`}</p>
                            </div>
                        </div>
                        <div className="col s4">
                            <p className="col s12">
                                {irrigationFactorResult.toFixed(2)} {` (${(parameters.irrigationPercentage/100).toFixed(2)} * ${irrigationFactor})`}
                            </p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col s6">
                            <div className="col s6">
                                <p>Result:</p>
                            </div>
                            <div className="col s6">
                                <p>{tillableResult.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="col s6">
                            <div className="col s6">
                                <p>Blended Result:</p>
                            </div>
                            <div className="col s6">
                                <p>{(blendedResult * 100).toFixed(2) + '%'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <h4 className="e-value-text-green">Rating Conclusions</h4>
                    </div>
                    <div className="row">
                        <div className="col s6">
                            <div className="col s6">
                                <p>Gross Potential Average:</p>
                            </div>
                            <div className="col s6">
                                <p>{grossPotentialAverage}</p>
                            </div>
                        </div>
                        <div className="col s6">
                            <div className="col s6">
                                <p>Total Subject Score:</p>
                            </div>
                            <div className="col s6">
                                <p>{totalSubjectScore}</p>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col s6">
                            <p className="rating-conclusions">Percentage Above or Below Avg:</p>
                        </div>
                        <div className="col s6">
                            <p className="rating-conclusions">{(percentageAboveBelow * 100).toFixed(2) + '%'}</p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col s6">
                            <p className="rating-conclusions">Reconciled Overall Rating</p>
                        </div>
                        <div className="col s6">
                            <p className="rating-conclusions"><b>{reconciledOverallRating}</b></p>
                        </div>
                    </div>
                </div> */}
                <ImprovementsComponent improvements={parameters.improvements} addImprovement={this.props.addImprovement} removeImprovement={this.props.removeImprovement} onClickDelete={this.props.onClickDelete} />
                <div className="row">
                    <div className="w-col">
                    <h1 className="e-value-text-green">Set Comparable Parameters:</h1>
                    </div>
                </div>
                <div className="row" id="statistical-parameters">
                    <div className="w-col">
                    {/** Statistical Parameters **/}
                    <h3 class="rating-subheader">Acreage</h3>
                    <div className="row">
                        {/**Acreage Min and Max **/}
                        {/* <div className="col s2">
                            <p>Acreage:</p>
                        </div> */}
                        <div className="col s9">
                            <div className="col s6 w-col">
                                <label htmlFor="acreageMin" className="eval-field-label">Minimum</label>
                                <input id="acreageMin" className="eval-input w-input-select" type="number" min="0.00" step="50.0"
                                       value={parameters.acreageMin}
                                       onChange={this.props.onParametersChange('acreageMin')} placeholder=""/>
                            </div>
                            <div className="col s6 w-col">
                                <label htmlFor="acreageMax" className="eval-field-label">Maximum</label>
                                <input id="acreageMax" className="eval-input w-input-select" type="number" min="0.00" step="50.0"
                                       value={parameters.acreageMax}
                                       onChange={this.props.onParametersChange('acreageMax')} placeholder=""/>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        {/** Date of Sale **/}
                        <h3 class="rating-subheader">Date of Sale</h3>
                        {/* <div className="col s2">
                            <p>Date of Sale:</p>
                        </div> */}
                        <div className="col s9">
                            <div className="col s6 w-col">
                                <label htmlFor="oldest" className="eval-field-label">Oldest</label>
                                <DatePicker className="eval-input w-input-select" value={parameters.dateOfSaleMin == null ? null : parameters.dateOfSaleMin.toDate()}
                                onChange={(event, value) => this.props.onParametersChange('dateOfSaleMin')({target: {value}})}
                                hintText="Minimum"  openToYearSelection={true}/>
                            </div>
                            <div className="col s6 w-col">
                                <label htmlFor="newest" className="eval-field-label">Newest</label>
                                <DatePicker className="eval-input w-input-select" value={parameters.dateOfSaleMax == null ? null : parameters.dateOfSaleMax.toDate()}
                                onChange={(event, value) => this.props.onParametersChange('dateOfSaleMax')({target: {value}})}
                                hintText="Maximum" openToYearSelection={true}/>
                            </div>
                        </div>
                    </div>
                    <h3 class="rating-subheader">Do you want to exclude outliers?</h3>
                    <div className="row col s6 w-col" data-position="top" data-delay="50"
                          data-tooltip="Select the appropriate % of outliers to exclude from the origin dataset.">
                          {/* <div className="col s2">
                             <p style={{wordWrap: 'break-word'}}>Choose to calibrate dataset:</p>
                         </div>  */}
                        <label htmlFor="" className="eval-field-label">Outlier Exclusoin</label>
                        <select className="eval-input w-input-select" 
                               value={parameters.outlierPercentageExclusion}
                               onChange={this.props.onParametersChange('outlierPercentageExclusion')} s={10}>
                            <option value="0">None</option>
                            {[...Array(10).keys()].map((num) => {
                                let percentage = (num + 1) * 5;
                                return (
                                    <option value={percentage/100}>{percentage + '%'}</option>
                                );
                            })}
                        </select>
                    </div>
                    {/* <div className="row">
                      <div className="col s6">
                        <div className="col s6">
                          <p>Total Beginning Population:</p>
                        </div>
                        <div className="col s6">
                          <p>{this.props.beginningPopulation}</p>
                        </div>
                      </div>
                      <div className="col s6">
                        <div className="col s6">
                          <p>Total After Calibration:</p>
                        </div>
                        <div className="col s6">
                          <p>{this.props.afterCalibration}</p>
                        </div>
                      </div>
                    </div> */}
                    </div>
                </div>
                {this.renderPDFImages()}
                <div className="row">
                    <div className="w-col">
                        <h1 className="e-value-text-green">PDF Comments</h1>
                    </div>    
                </div>
                <div className="row">
                  <div className="row">
                    <div className="col s6">
                      <label htmlFor="taxOverheadNotes" className="eval-field-label">Comment 1 (Optional)</label>
                      <textarea value={parameters.taxOverheadNotes == null ? '' : parameters.taxOverheadNotes}
                      id="taxOverheadNotes" className="materialize-textarea eval-input" onChange={this.props.onParametersChange('taxOverheadNotes')}/>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col s6">
                      <label htmlFor="additionalExhibitsNotes" className="eval-field-label">Comment 2 Notes (Optional)</label>
                      <textarea value={parameters.additionalExhibitsNotes == null ? '' : parameters.additionalExhibitsNotes}
                      id="additionalExhibitsNotes" className="materialize-textarea eval-input" onChange={this.props.onParametersChange('additionalExhibitsNotes')}/>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col s6">
                        <label htmlFor="soilsNotes" className="eval-field-label">Comment 3 (Optional)</label>
                      <textarea value={parameters.soilsNotes == null ? '' : parameters.soilsNotes}
                      id="soilsNotes" className="materialize-textarea eval-input" onChange={this.props.onParametersChange('soilsNotes')}/>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col s6">
                      <label htmlFor="floodMapNotes" className="eval-field-label">Comment 4 (Optional)</label>
                      <textarea value={parameters.floodMapNotes == null ? '' : parameters.floodMapNotes}
                      id="floodMapNotes" className="materialize-textarea eval-input" onChange={this.props.onParametersChange('floodMapNotes')}/>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col s6">
                    <label htmlFor="textarea1" className="eval-field-label">Custom Certification (Optional)</label>
                    <textarea value={parameters.customCertification == null ? '' : parameters.customCertification}
                    id="textarea1" className="materialize-textarea eval-input" onChange={this.props.onParametersChange('customCertification')}/>
                  </div>
                </div>
                <div className="row">
                  <div className="col s12">
                   <div className="submit-button inverse w-button" onClick={()=>this.props.saveEvaluation()}>Save</div> 
                   {/* <div className="submit-button inverse report w-button" style={{marginLeft: 5}} >Create Report</div> */}
                   <div className="submit-button inverse report w-button" style={{marginLeft: 5}} onClick={()=>this.props.onClickSubmit()}>Create Report</div>

                  </div>
                </div>


            </div>
            </div>
            </MuiThemeProvider>

        );
    }
}

export default EvaluationParameters
