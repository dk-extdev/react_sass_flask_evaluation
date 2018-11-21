/**
 * Created by rayde on 1/5/2018.
 */
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {fetchLandData} from '../ducks/landData'
import {createEvaluation, downloadPDF} from '../ducks/evaluation'
import * as actionTypes from '../ducks/constants'
import EvaluationParameters from '../components/EvaluationParameters'
import ValuationSummary from '../components/ValuationSummary'
import Spinner from '../components/Spinner'
import ProgressBar from '../components/ProgressBar'
import moment from 'moment'
import SaveEvaluationModal from '../components/SaveEvaluationModal'
import {push} from 'react-router-redux'
import { cookies } from '../app'
import Settings from '../containers/Settings';

const mapStateToProps = (state, ownProps) => {
    return {
        type: ownProps.location.pathname.includes('new') ? 'new' : 'existing', // new or existing
        id: ownProps.location.pathname.includes('new') ? null : ownProps.location.params.id,
        organization: state.user.organization,
        areas: state.user.areas,
        counties: state.user.counties,
        newEvaluation: state.evaluation.newEvaluation, //Implement this later. This is basically like caching a form if they leave the page.
        landData: state.landData.landData,
        isFetchingLandData: state.landData.isFetchingLandData,
        isSavingEvaluation: state.evaluation.isPosting,
        isPDFDownloading: state.evaluation.isPDFDownloading,
        saveProgress: state.evaluation.saveProgress,
        saveProgressTotal: state.evaluation.saveProgressTotal
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        getLandData: (counties) => {
            dispatch(fetchLandData(actionTypes.FETCH, {counties}));
        },
        generatePDF: (params) => {
            dispatch(downloadPDF(actionTypes.FETCH, {params}))
        },
        saveEvalAndPDF: (params) => {
            dispatch(downloadPDF(actionTypes.FETCH, {params, saveEval: true, filename: params.pdfFilename}))
        },
        goToEvals: () => {
            dispatch(push('/evaluations'));
        },
        saveEval: (params) => {
            dispatch(createEvaluation(actionTypes.CREATE, {params}));
        }
    }
};

class NewEvaluationContainer extends Component {
    constructor(props) {
        super(props);
        const initialTillable = 80.00;
        const initialUntillable = 20.00;
        const initialIrrigation = 0.00;

        const {organization} = this.props;
        let farmableFactor = 1.15;
        let nonfarmableFactor = 0.75;
        let irrigationFactor = 0;

        if(organization != null){
          if(organization.farmableFactor != null){
            farmableFactor = organization.farmableFactor;
          }
          if(organization.nonfarmableFactor != null) {
            nonfarmableFactor = organization.nonfarmableFactor;
          }
          if(organization.irrigationFactor != null) {
            irrigationFactor = organization.irrigationFactor;
          }
        }

        const tillableFactor = ((initialTillable / 100)) * farmableFactor;
        const unTillableFactor = ((initialUntillable / 100)) * nonfarmableFactor;
        const irrigationFactorResult = 0;
        const tillableResult = tillableFactor + unTillableFactor + irrigationFactorResult;
        const blendedResult = tillableResult - 1;



        // state = { show: false };

        // showModal = () => {
        //   this.setState({ show: true });
        // };
      
        // hideModal = () => {
        //   this.setState({ show: false });
        // };

        //Need to do some initial set up if land data already exists.
        this.state = {
    //        show: false,
            valuation: {
                modMinMax: 0,
                modMax: null,
                modMin: null,
                min: null,
                max: null,
                stndDeviation: null,
                median: null,
                sqrtDataCount: null,
                stndError: null,
                average: null,
                multiplier: null,
                valueUnitConcluded: null,
                reconciledPerUnit: null
            },
            parameters: {
                marketArea: 'entireMarketArea', // entireMarketArea, county-{id}, area-{id}
                currentListing: false,
                currentListingPrice: 0.00,
                propertySoldLastThreeYears: false,
                salePrice: 0.00,
                dateSold: null,
                ownerBorrower: this.props.organization.name,
                legalPhysicalAccess: true,
                acres: 100,
                tillable: initialTillable,
                unTillable: initialUntillable,
                irrigationPercentage: initialIrrigation,
                dateOfInspection: null,
                roadFrontage: 5,
                accessFrontageEasement: 5,
                accessIngressEgressQuality: 5,
                contiguousParcels: 5,
                topography: 5,
                soils: 5,
                drainage: 5,
                additionalField1: {value: null, fieldName: '', placeholder: 'Irrigation'},
                additionalField2: {value: null, fieldName: '', placeholder: 'Rivers, Creeks, Ponds'},
                additionalField3: {value: null, fieldName: '', placeholder: 'Marketable Timber'},
                acreageMin: '',
                acreageMax: '',
                dateOfSaleMin: null,
                dateOfSaleMax: null,
                outlierPercentageExclusion: '0',
                didYouPhysicallyInspectProperty: false,
                improvements: {
                    totalImprovementsValue: 0,
                    improvements: []
                }
            },
            propertyRatingParams: {
                tillableFactor,
                unTillableFactor,
                irrigationFactorResult,
                tillableResult,
                blendedResult,
                grossPotentialAverage: 35,
                totalSubjectScore: 35,
                percentageAboveBelow: ((35 / (7 * 5)) - 1) + blendedResult,
                reconciledOverallRating: 'Above Average'
            },
            areaFilteredLandData: this.props.landData, //Changes with Market Area
            statisticalFilteredLandData: this.props.landData, // Changes with area filtered and statistical parameters
            marketTrendGraph: {
                scatterData: '',
                trendData: '',
                m: 0,
                b: 0,
                R2: 1
            },
            pdfFilename: '',
            farmableFactor,
            nonfarmableFactor,
            irrigationFactor,
            pdfImages: {
              propertyPictures: [{isProcessing: false}, {isProcessing: false}, {isProcessing: false}],
              additionalExhibits: [{isProcessing: false, pageName: ''}, {isProcessing: false, pageName: ''}, {isProcessing: false, pageName: ''}],
              signature: {isProcessing: false}
            }
        };
        this.renderSpinner = this.renderSpinner.bind(this);
        this.onParametersChange = this.onParametersChange.bind(this);
        this.propertyRatingHandler = this.propertyRatingHandler.bind(this);
        this.statHandler = this.statHandler.bind(this);
        this.areaFilteredLandDataHandler = this.areaFilteredLandDataHandler.bind(this);
        this.downloadPDF = this.downloadPDF.bind(this);
        this.updateMarketTrendGraph = this.updateMarketTrendGraph.bind(this);
        this.validateState = this.validateState.bind(this);
        this.onClickSubmit = this.onClickSubmit.bind(this);
        this.submit = this.submit.bind(this);
        this.onChangeFilename = this.onChangeFilename.bind(this);
        this.onPDFImagesChange = this.onPDFImagesChange.bind(this);
        this.clearPDFImages = this.clearPDFImages.bind(this);
        this.additionalExhibitsNameChange = this.additionalExhibitsNameChange.bind(this);
        this.renderProgressBar = this.renderProgressBar.bind(this);
        this.removeImprovement = this.removeImprovement.bind(this);
        this.addImprovement = this.addImprovement.bind(this);
        this.saveEvaluation = this.saveEvaluation.bind(this);
    }
    // showModal = () => {
    //     this.setState({ show: true });
    //   };
    
    //   hideModal = () => {
    //     this.setState({ show: false });
    //   };
    componentDidMount() {
        const {isFetchingLandData, landData, getLandData, counties} = this.props;
        if (landData.length === 0 && !isFetchingLandData) {
            getLandData(counties.map((county) => county.id));
        }
        else
         {
            // Update Valuation
            this.statHandler({parameters: {}, propertyRatingParams: {}, areaFilteredLandData: []})
        }
        $('#valuationModal').modal();
        $('#settingModal').modal();
    }
    componentWillUnmount(){
        $('#valuationModal').modal('close');
        $('#settingModal').modal('close');
      }
    componentDidUpdate(previousProps, previousState) {
        if(previousProps.organization == null && this.props.organization != null){
          const {organization} = this.props;
          let farmableFactor = 1.15;
          let nonfarmableFactor = 0.75;
          let irrigationFactor = 0.00;

          if(organization != null){
            if(organization.farmableFactor != null){
              farmableFactor = organization.farmableFactor;
            }
            if(organization.nonfarmableFactor != null) {
              nonfarmableFactor = organization.nonfarmableFactor;
            }
            if(organization.irrigationFactor != null){
              irrigationFactor = organization.irrigationFactor;
            }
          }
          this.setState({
            farmableFactor,
            nonfarmableFactor,
            irrigationFactor
          })
        }
        this.propertyRatingHandler(previousState.parameters);
        this.areaFilteredLandDataHandler(previousProps, previousState);
        this.statHandler(previousState);
    }

    areaFilteredLandDataHandler(prevProps, prevState) {
        if ((prevProps.isFetchingLandData === true && this.props.isFetchingLandData === false) || (prevState.parameters.marketArea !== this.state.parameters.marketArea)) {
            if (this.state.parameters.marketArea === 'entireMarketArea') {
                this.setState({
                    areaFilteredLandData: this.props.landData
                })
            }
            else if (this.state.parameters.marketArea.includes('area')) {
                const areaId = parseInt(this.state.parameters.marketArea.split('-')[1]);
                const area = this.props.areas.find((a) => a.id === areaId);
                this.setState({
                    areaFilteredLandData: this.props.landData.filter((ld) => area.counties.find((county) => county.id === ld.county.id))
                });
            }
            else if (this.state.parameters.marketArea.includes('county')) {
                const countyId = parseInt(this.state.parameters.marketArea.split('-')[1]);
                this.setState({
                    areaFilteredLandData: this.props.landData.filter((ld) => ld.county.id === countyId)
                });
            }


        }
    }

    statHandler(prevState) {
        const fields = ['acreageMin', 'acreageMax', 'dateOfSaleMin', 'dateOfSaleMax', 'outlierPercentageExclusion', 'acres'];
        const statsChanged = fields.reduce((bool, field) => {
            if (prevState.parameters[field] !== this.state.parameters[field]) {
                return true;
            }
            return bool;
        }, false);

        //I wasn't looking for a change in the percentageAboveBelow

        const percentageAboveBelowChange = prevState.propertyRatingParams.percentageAboveBelow !== this.state.propertyRatingParams.percentageAboveBelow;

        if ((prevState.areaFilteredLandData.length !== this.state.areaFilteredLandData.length) || statsChanged || percentageAboveBelowChange) {
            // Compute a new stats filtered land data array and stats values.
            const {parameters, areaFilteredLandData, propertyRatingParams} = this.state;
            const numPropertiesMarketArea = areaFilteredLandData.length;
            // Do Max, ModMax, ModMaxMin, Min, ModMin first. Then stats ld array. Then rest of stats. Then value.
            const modMinMax = parameters.outlierPercentageExclusion == '0' || numPropertiesMarketArea === 0 ? 0 :
            (parameters.outlierPercentageExclusion * numPropertiesMarketArea) / 2;
            const sortFunction = ({salePriceNum: a, acres: acreA}, {salePriceNum: b, acres: acreB}) => (a/acreA) < (b/acreB) ? -1 : (a/acreA) > (b/acreB) ? 1 : 0;
            const sortedAreaLD = areaFilteredLandData.sort(sortFunction);
            const max = areaFilteredLandData.length === 0 ? 0 : sortedAreaLD[sortedAreaLD.length - 1].salePriceNum/sortedAreaLD[sortedAreaLD.length - 1].acres;
            const modMax = modMinMax === 0 ? max : sortedAreaLD[(sortedAreaLD.length - 1) - Math.floor(modMinMax)].salePriceNum/sortedAreaLD[(sortedAreaLD.length - 1) - Math.floor(modMinMax)].acres;
            const min = areaFilteredLandData.length === 0 ? 0 : sortedAreaLD[0].salePriceNum/sortedAreaLD[0].acres;
            const modMin = modMinMax === 0 ? min : sortedAreaLD[Math.floor(modMinMax)].salePriceNum/sortedAreaLD[Math.floor(modMinMax)].acres;

            let statsFilteredLandData = areaFilteredLandData.filter((ld) => {
                const {acres, saleDate, salePriceNum} = ld;
                const mDateOfSale = moment(saleDate);
                const price = salePriceNum/acres;
                const maxAcres = parameters.acreageMax == '' ? true : acres <= parameters.acreageMax;
                const minAcres = parameters.acreageMin == '' ? true : acres >= parameters.acreageMin;
                const maxSale = parameters.dateOfSaleMax == null ? true : mDateOfSale <= parameters.dateOfSaleMax;
                const minSale = parameters.dateOfSaleMin == null ? true : mDateOfSale >= parameters.dateOfSaleMin;
                const saleMax = modMax === 0 ? true : price <= modMax;
                const saleMin = modMin === 0 ? true : price >= modMin;
                return maxAcres && minAcres && maxSale && minSale && saleMax && saleMin;
            });

            if(parameters.dateOfSaleMin != prevState.parameters.dateOfSaleMin){
              console.log('Old Land Data Length: ', prevState.statisticalFilteredLandData.length);
              console.log('New Land Data Length', statsFilteredLandData.length);
            }

            const sortedStatLD = statsFilteredLandData.sort(sortFunction);

            // Average and Standard Deviation
            const averageFunc = (nums) => {
                const sum = nums.reduce((sum, value) => {
                    return sum + value;
                }, 0);
                return sum / nums.length;
            };

            const average = averageFunc(sortedStatLD.map((ld) => ld.salePriceNum/ld.acres));

            const squareDiffs = sortedStatLD.map((value) => {
                const diff = (value.salePriceNum/value.acres) - average;
                return diff * diff;
            });

            const avgSquareDiff = averageFunc(squareDiffs);

            const stndDeviation = Math.sqrt(avgSquareDiff);

            // Median

            const medianFunc =  (array) => {
                //array = array.sort();
                if (array.length % 2 === 0) { // array with even number elements
                    const left =  array[array.length / 2]
                    const right = array[(array.length / 2) - 1]
                    return ((left.salePriceNum/left.acres) + (right.salePriceNum/right.acres)) / 2;
                }
                else {
                    const middleValue = array[(array.length - 1) / 2]
                    return middleValue.salePriceNum/middleValue.acres; // array with odd number elements
                }
            };

            const median = sortedStatLD.length == 0 ? 0 : medianFunc(sortedStatLD);


            // Sqrt Data Count.
            const sqrtDataCount = Math.sqrt(sortedStatLD.length);

            // Stnd Error
            const stndError = sqrtDataCount === 0 ? 0 : stndDeviation/sqrtDataCount;

            //Reconciled per unit and Value/Unit Concluded.
            const {reconciledOverallRating, percentageAboveBelow} = propertyRatingParams;
            const {acres} = parameters;

            const multiplier = percentageAboveBelow + 1;

            const reconciledPerUnit = reconciledOverallRating === 'Average' ? average : average * multiplier;

            const valueUnitConcluded = reconciledPerUnit * acres;

            const updatedValues = {
                valueUnitConcluded,
                reconciledPerUnit,
                multiplier,
                average,
                stndError,
                sqrtDataCount,
                median,
                stndDeviation,
                modMinMax,
                modMax,
                modMin,
                min,
                max
            };
            this.setState({
                valuation: Object.assign({}, this.state.valuation, updatedValues),
                statisticalFilteredLandData: sortedStatLD,
                areaFilteredLandData: sortedAreaLD
            })
        }
    }

    propertyRatingHandler(prevParameters) {
        const {parameters, farmableFactor, nonfarmableFactor, irrigationFactor} = this.state;
        // list of fields to check for diff.
        const fields = ['roadFrontage', 'accessFrontageEasement', 'accessIngressEgressQuality', 'contiguousParcels',
            'topography', 'soils', 'drainage', 'additionalField1', 'additionalField2', 'additionalField3',
            'tillable', 'unTillable', 'irrigationPercentage'
        ];

        const shouldUpdate = fields.reduce((bool, field) => {
            if(field == 'additionalField1' || field == 'additionalField2' || field == 'additionalField3'){
              if(parameters[field]['value'] !== prevParameters[field]['value']){
                return true;
              }
              return bool;
            }
            if (parameters[field] !== prevParameters[field]) {
                return true;
            }
            return bool;
        }, false);
        if (shouldUpdate) {
            const tillableFactor = ((parameters.tillable / 100)) * farmableFactor;
            const unTillableFactor = ((parameters.unTillable / 100)) * nonfarmableFactor;
            const irrigationFactorResult = ((parameters.irrigationPercentage/100)) * irrigationFactor
            const tillableResult = tillableFactor + unTillableFactor + irrigationFactorResult;
            const blendedResult = tillableResult - 1;

            let totalCharacters = 0;

            const propertyCharacters = ['roadFrontage', 'accessFrontageEasement', 'accessIngressEgressQuality', 'contiguousParcels',
                'topography', 'soils', 'drainage', 'additionalField1', 'additionalField2', 'additionalField3'];

            const totalSubjectScore = propertyCharacters.reduce((total, field) => {
                if(field == 'additionalField1' || field == 'additionalField2' || field == 'additionalField3'){
                  if(parameters[field]['value'] != null && (parameters[field]['value'] != '' || parameters[field]['value'] === 0)){
                    totalCharacters++;
                    return total + parameters[field]['value']
                  }
                  return total;
                }
                if (parameters[field] != null && (parameters[field] != '' || parameters[field] === 0)) {
                    totalCharacters++;
                    return total + parameters[field];
                }
                return total;
            }, 0);

            const grossPotentialAverage = totalCharacters * 5;

            const percentageAboveBelow = ((totalSubjectScore / (totalCharacters * 5)) - 1) + blendedResult;

            const percentageForm = percentageAboveBelow * 100;

            let reconciledOverallRating = percentageForm <= -1 ? 'Below Average' : percentageForm >= 1 ?
                'Above Average' : 'Average';

            this.setState({
                propertyRatingParams: Object.assign({}, this.state.propertyRatingParams, {
                    tillableFactor,
                    unTillableFactor,
                    irrigationFactorResult,
                    tillableResult,
                    blendedResult,
                    totalSubjectScore,
                    grossPotentialAverage,
                    percentageAboveBelow,
                    reconciledOverallRating
                })
            });
        }
    }

    renderSpinner() {
        const {isFetchingLandData} = this.props;
        if (isFetchingLandData) {
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

    renderProgressBar() {
      const {isSavingEvaluation, isPDFDownloading, saveProgress, saveProgressTotal} = this.props;
      if(isSavingEvaluation || isPDFDownloading){
        return (
          <div className="overlay-spinner">
              <div className="row container progress-bar-container">
                  <div className="center">
                      <ProgressBar loadPercentage={(parseFloat(saveProgress)/parseFloat(saveProgressTotal)) * 100}/>
                  </div>
              </div>
          </div>
        );
      }
    }

    onParametersChange(field) {
        return (event) => {
            if(field.includes('additionalField1') || field.includes('additionalField2') || field.includes('additionalField3')){
                if(field.includes('fieldName')){
                    let fieldName = field.split('-')[0];
                    this.setState({
                        parameters: Object.assign({}, this.state.parameters, {
                            [fieldName]: Object.assign({}, this.state.parameters[fieldName], {
                                fieldName: event.target.value
                            })
                        })
                    });
                }
                else {
                    this.setState({
                        parameters: Object.assign({}, this.state.parameters, {
                            [field]: Object.assign({}, this.state.parameters[field], {
                                value: event.target.value
                            })
                        })
                    })
                }
            }
            else {
                const target = event.target;
                const value = target.type === 'checkbox' ? target.checked : target.value;
                this.setState({
                    parameters: Object.assign({}, this.state.parameters, {
                        [field]: value instanceof Date ? moment(value) : value
                    })
                });
            }
        }
    }

    downloadPDF(saveEval=false){
        this.props.generatePDF(Object.assign({}, this.state,
            {organization: this.props.organization, areas: this.props.areas, counties: this.props.counties, saveEval}));
    }
    updateMarketTrendGraph(data){
        this.setState({
            marketTrendGraph: Object.assign({}, this.state.marketTrendGraph, data)
        });
    }
    validateState(){
        // This needs to be called before a submit or pdf download
        // Required Params with no Default: mapParcelNumber, propertyAddress, propertyCity, propertyState, propertyPostalCode
        const {parameters, pdfImages} = this.state;
        if(parameters.mapParcelNumber == null){
            Materialize.toast('Map Parcel Number is required', 5000, 'red');
            return false;
        }
        if(parameters.propertyAddress == null){
            Materialize.toast('Property Address is required', 5000, 'red');
            return false;
        }
        if(parameters.propertyCity == null){
            Materialize.toast('Property City is required', 5000 , 'red');
            return false;
        }
        if(parameters.propertyState == null){
            Materialize.toast('Property State is required', 5000, 'red');
            return false;
        }
        if(parameters.propertyPostalCode == null){
            Materialize.toast('Property Postal Code is required', 5000, 'red');
            return false;
        }
        if(parameters.tillable == '' || parameters.tillable == null){
            Materialize.toast('Farmable Factor needs to be filled out. Even if it is 0')
            return false;
        }
        if(parameters.unTillable == '' || parameters.unTillable == null){
            Materialize.toast('Non Farmable Factor needs to be filled out. Even if it is 0');
            return false;
        }
        const picturesValid = pdfImages.additionalExhibits.reduce((bool, pic) => {
          if(pic.pageName != '' && pic.fileURI == null){
            Materialize.toast('You need to upload a photo under Additional Pictures or delete the page name.', 8000, 'red');
            return false;
          }
          if(pic.pageName == '' && pic.fileURI != null){
            Materialize.toast('You need to add a Page Name to the file you uploaded under Additional Pictures.', 8000, 'red');
            return false;
          }
          return bool;
        }, true);
        const additionalFields = [parameters.additionalField1, parameters.additionalField2, parameters.additionalField3];
        const additionalFieldsValid = additionalFields.reduce((bool, field) => {
          if(field['fieldName'] == '' && field['value'] != null){
            Materialize.toast('Make sure that both the Feature Name and Value are set on Additional Property Rating Fields', 8000, 'red');
            return false;
          }
          if(field['fieldName'] != '' && field['value'] == null){
            Materialize.toast('Make sure that both the Feature Name and Value are set on Additional Property Rating Fields', 8000, 'red');
            return false;
          }
          return bool;
        }, true);

        return picturesValid && additionalFieldsValid;
    }
    submit(){
     /*   if(this.state.pdfFilename === ''){
            Materialize.toast('You need a PDF filename', 5000, 'red');
            return;
        }
       */ const {tillable, unTillable} = this.state.parameters;
        if(this.state.parameters.irrigationPercentage === null || this.state.parameters.irrigationPercentage === undefined || this.state.parameters.irrigationPercentage == ''){
            //this.state.parameters.irrigationPercentage = 0;
            this.setState({
                parameters: Object.assign({}, this.state.parameters, {
                    irrigationPercentage: 0
                })
            })
        }
        if(tillable === null || tillable === undefined || tillable == ''){
            this.setState({
                parameters: Object.assign({}, this.state.parameters, {
                    tillable: 0
                })
            })
        }
        if(unTillable === null || unTillable === undefined || unTillable == ''){
            this.setState({
                parameters: Object.assign({}, this.state.parameters, {
                    unTillable: 0
                })
            })
        }
        this.props.saveEvalAndPDF(Object.assign({}, this.state, {areas: this.props.areas, counties: this.props.areas, orgId: this.props.organization.id, organization: this.props.organization}));
        $('#saveEvalModal').modal('close');
    }
    onClickSubmit(){
        // Get Modal to pop up.
       const valid = this.validateState();
       if(valid)
        {
            this.setState({
              pdfFilename: (moment().format('YYYY-MM-DD') + ' ' + this.state.parameters.propertyAddress + 'Eval').replace('.', '')
            })
        //  $('#saveEvalModal').modal('open');
        this.submit();
        }

    }
    saveEvaluation(){
        // This just saves the evalation. Since I am not generating a PDF, there is no minimum required data.
        const valid = this.validateState();
        if(valid){
          this.props.saveEval(Object.assign({}, this.state, {orgId: this.props.organization.id}));
        }
    }
    onChangeFilename(event){
        this.setState({
            pdfFilename: event.target.value.replace('.', '')
        });
    }

    onPDFImagesChange(type, index=null){
      return (event) => {
        const file = event.target.files[0];
        if (file != null) {
            if(type === 'signature'){
              this.setState({
                pdfImages: Object.assign({}, this.state.pdfImages, {
                  signature: {
                    isProcessing: true,
                    file
                  }
                })
              });
            }
            else {
              this.setState({
                pdfImages: Object.assign({}, this.state.pdfImages, {
                  [type]: this.state.pdfImages[type].map((pic, i) => {
                    if(index === i){
                      return Object.assign({}, pic, {
                        isProcessing: true,
                        file
                      })
                    }
                    return pic;
                  })
                })
              })
            }
            const reader = new FileReader();
            reader.onload = (upload) => {
                if(type === 'signature'){
                  this.setState({
                    pdfImages: Object.assign({}, this.state.pdfImages, {
                      signature: Object.assign({}, this.state.pdfImages.signature, {
                        isProcessing: false,
                        fileURI: upload.target.result
                      })
                    })
                  });
                }
                else {
                  this.setState({
                    pdfImages: Object.assign({}, this.state.pdfImages, {
                      [type]: this.state.pdfImages[type].map((pic, i) => {
                          if(index === i){
                            return Object.assign({}, pic, {
                              isProcessing: false,
                              fileURI: upload.target.result
                            })
                          }
                          return pic;
                      })
                    })
                  })
                }
            };
            reader.readAsDataURL(file);
        }
      }
    }

    clearPDFImages(type, index=null){
      return () => {
        if(type === 'signature'){
          this.setState({
            pdfImages: Object.assign({}, this.state.pdfImages, {
              signature: Object.assign({}, this.state.pdfImages.signature, {
                isProcessing: false,
                file: null,
                fileURI: null
              })
            })
          });
        }
        else {
          this.setState({
            pdfImages: Object.assign({}, this.state.pdfImages, {
              [type]: this.state.pdfImages[type].map((pic, i) => {
                if(index === i){
                  return Object.assign({}, pic, {
                    isProcessing: false,
                    file: null,
                    fileURI: null
                  });
                }
                return pic;
              })
            })
          });
        }
      }
    }

    additionalExhibitsNameChange(index){
      return (event) => {
        this.setState({
          pdfImages: Object.assign({}, this.state.pdfImages, {
            additionalExhibits: this.state.pdfImages.additionalExhibits.map((pic, i) => {
              if(index === i){
                return Object.assign({}, pic, {
                  pageName: event.target.value
                })
              }
              return pic;
            })
          })
        });
      }
    }

    addImprovement(params){
        const improvements = this.state.parameters.improvements.improvements.concat(params);
        this.setState({
            parameters: Object.assign({}, this.state.parameters, {
                  improvements: {
                      improvements,
                      totalImprovementsValue: improvements.reduce((sum, i) => i.valueUnitCalculation + sum, 0)
                  }
            })
        })
    }

    removeImprovement(index) {
        const improvements = this.state.parameters.improvements.improvements.filter((improvement, i) => i !== index);
        this.setState({
            parameters: Object.assign({}, this.state.parameters, {
                improvements: {
                    improvements,
                    totalImprovementsValue: improvements.reduce((sum, i) => i.valueUnitCalculation + sum, 0)
                }
            })
        })
    }

    render() {
        return (
            <div className="col s12 row">
                {this.renderSpinner()}
                {this.renderProgressBar()}
                <SaveEvaluationModal filename={this.state.pdfFilename} onChangeFilename={this.onChangeFilename} submit={this.submit}/>
                <div className="modal scroll-modal" id="settingModal">
                <Settings/>
                </div>   
                <EvaluationParameters parameters={this.state.parameters}
                                      orgName={this.props.organization.name}
                                      address={this.props.organization.address}
                                      counties={this.props.counties}
                                      areas={this.props.areas} onParametersChange={this.onParametersChange}
                                      propertyRatingParams={this.state.propertyRatingParams} farmableFactor={this.state.farmableFactor} nonfarmableFactor={this.state.nonfarmableFactor}
                                      irrigationFactor={this.state.irrigationFactor}
                                      beginningPopulation={this.state.areaFilteredLandData.length} afterCalibration={this.state.statisticalFilteredLandData.length}
                                      pdfImages={this.state.pdfImages} additionalExhibitsNameChange={this.additionalExhibitsNameChange}
                                      clearPDFImages={this.clearPDFImages} onPDFImagesChange={this.onPDFImagesChange} removeImprovement={this.removeImprovement} addImprovement={this.addImprovement}
                                      saveEvaluation={this.saveEvaluation} onClickSubmit={this.onClickSubmit}/>
        <div className="modal scroll-modal" id="valuationModal">
                <ValuationSummary valuation={this.state.valuation}
                                  propertyRating={this.state.propertyRatingParams.reconciledOverallRating}
                                  acres={this.state.parameters.acres} scatterData={this.state.statisticalFilteredLandData} downloadPDF={this.downloadPDF}
                                  updateMarketTrendGraph={this.updateMarketTrendGraph} onClickSubmit={this.onClickSubmit} onClickDelete={this.props.goToEvals} improvements={this.state.parameters.improvements}
                                  saveEvaluation={this.saveEvaluation}/>
        </div>                          
            </div>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NewEvaluationContainer)
