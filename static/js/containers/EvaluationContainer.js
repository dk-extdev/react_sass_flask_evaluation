import React, {Component} from 'react'
import {connect} from 'react-redux'
import {fetchLandData} from '../ducks/landData'
import {createEvaluation,downloadPDF,fetchEvaluations, deleteEvaluation, clearEvaluationsCache, updateEvaluation, fetchEvaluationById} from '../ducks/evaluation'
import {fetchOrgs} from '../ducks/organization'
import * as actionTypes from '../ducks/constants'
import EvaluationParameters from '../components/EvaluationParameters'
import ValuationSummary from '../components/ValuationSummary'
import Spinner from '../components/Spinner'
import ProgressBar from '../components/ProgressBar'
import moment from 'moment'
import SaveEvaluationModal from '../components/SaveEvaluationModal'
import {cookies} from '../app'
import Settings from '../containers/Settings'

const nullToString = (value) => {
    return value == null ? '' : value
}

const mapStateToProps = (state, ownProps) => {
    return {
        id: ownProps.params.evalId,
        organization: ownProps.params.orgId == null ? state.user.organization : state.organization.organizations.find((o) => ownProps.params.orgId == o.id),
        orgId: ownProps.params.orgId == null ? null : ownProps.params.orgId,
        areas: ownProps.params.orgId == null ? state.user.areas :
          state.organization.organizations.find((o) => ownProps.params.orgId == o.id) == null ? [] : state.organization.organizations.find((o) => ownProps.params.orgId == o.id).areas,
        counties: ownProps.params.orgId == null ? state.user.counties :
          state.organization.organizations.find((o) => ownProps.params.orgId == o.id) == null ? [] : state.organization.organizations.find((o) => ownProps.params.orgId == o.id).counties ,
        landData: state.landData.landData,
        isFetchingLandData: state.landData.isFetchingLandData,
        isSavingEvaluation: state.evaluation.isPosting,
        isPDFDownloading: state.evaluation.isPDFDownloading,
        evaluations: state.evaluation.evaluations,
        isFetchingEvaluations: state.evaluation.isFetching,
        hasFetchedEvaluations: state.evaluation.hasFetched,
        saveProgress: state.evaluation.saveProgress,
        saveProgressTotal: state.evaluation.saveProgressTotal,
        isFetchingOrgs: state.organization.isFetching,
        hasFetchedOrgs: state.organization.hasFetched,
        isFetchingSingleEvaluation: state.evaluation.isFetchingSingle
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        getLandData: (counties) => {
            dispatch(fetchLandData(actionTypes.FETCH, {
                counties
            }));
        },
        generatePDF: (params) => {
            dispatch(downloadPDF(actionTypes.FETCH, {
                params
            }))
        },
        saveEvalAndPDF: (params) => {
            dispatch(downloadPDF(actionTypes.FETCH, {
                params,
                saveEval: false,
                existingEval: true,
                filename: params.pdfFilename
            }))
        },
        getEvals: (orgId) => {
            dispatch(fetchEvaluations(actionTypes.FETCH, {
                orgId
            }));
        },
        getEvalById: (evalId) => {
            dispatch(fetchEvaluationById(actionTypes.FETCH, {evalId}))
        },
        deleteEval: (evalId) => {
            dispatch(deleteEvaluation(actionTypes.FETCH, {evalId}));
        },
        getOrgs: () => {
            dispatch(fetchOrgs(actionTypes.FETCH));
        },
        clearEvalStore: () => {
            dispatch(clearEvaluationsCache());
        },
        saveEval: (params) => {
            dispatch(updateEvaluation(actionTypes.UPDATE, {params}));
        }
    }
};

class EvaluationContainer extends Component {
    constructor(props) {
        super(props);
        const { hasFetchedEvaluations, isFetchingEvaluations, isFetchingSingleEvaluation} = this.props;
        const { organization } = this.props;
        let farmableFactor = 1.15;
        let nonfarmableFactor = 0.75;
        let irrigationFactor = 0.00;

        if (organization != null) {
            if (organization.farmableFactor != null) {
                farmableFactor = organization.farmableFactor;
            }
            if (organization.nonfarmableFactor != null) {
                nonfarmableFactor = organization.nonfarmableFactor;
            }
            if (organization.irrigationFactor != null) {
                irrigationFactor = organization.irrigationFactor;
            }
        }
        //if (!hasFetchedEvaluations || isFetchingEvaluations || this.props.landData.length === 0 || this.props.isFetchingLandData) {
            const initialTillable = 80.00;
            const initialUntillable = 20.00;
            const irrigationInitial = 0.00;

            const tillableFactor = ((initialTillable / 100)) * farmableFactor;
            const unTillableFactor = ((initialUntillable / 100)) * nonfarmableFactor;
            const irrigationFactorResult = 0;
            const tillableResult = tillableFactor + unTillableFactor + irrigationFactorResult;
            const blendedResult = tillableResult - 1;

            //Need to do some initial set up if land data already exists.
            this.state = {
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
                    ownerBorrower: this.props.organization != null ? this.props.organization.name : '',
                    legalPhysicalAccess: true,
                    acres: 100,
                    tillable: initialTillable,
                    unTillable: initialUntillable,
                    irrigationPercentage: irrigationInitial,
                    propertyCountry: 'USA',
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
                        improvements: [],
                        totalImprovementsValue: 0,
                        updated: false
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
                    R2: 1,
                    savedScatterData: [],
                    savedTrendData: []
                },
                pdfFilename: '',
                pdf: '',
                pdfURI: null,
                pdfImages: {
                    propertyPictures: [{isProcessing: false, updated: false}, {
                        isProcessing: false,
                        updated: false
                    }, {isProcessing: false, updated: false}],
                    signature: {isProcessing: false, updated: false},
                    additionalExhibits: [{isProcessing: false, pageName: '', updated: false}, {
                        isProcessing: false,
                        pageName: '',
                        updated: false
                    }, {isProcessing: false, pageName: '', updated: false}]
                },
                farmableFactor,
                nonfarmableFactor,
                irrigationFactor,
                updated: false,
                evalLoaded: false
            };
        //}
        // else {
        //     // Populate state with Eval.
        //     const { evaluations, id, landData, areas, counties} = this.props;
        //     const evaluation = evaluations.find((e) => e.id === parseInt(id));
        //     const {marketAreaType, marketArea, currentListing, currentListingPrice, propertySoldLastThreeYears, salePriceString, salePrice, dateSold,
        //         currentUse, highestAndBestUse, marketingExposureTime, landAssessmentTaxAssessor, buildingAssessmentTaxAssessor, owner, propertyAddress,
        //         mapParcelNumber, legalPhysicalAccess, zoning, utilities, propertyRights, propertyType, tillable, nonTillable, irrigationPercentage, acres,
        //         evaluator, dateOfInspection, propertyRating, statisticalParameters, max, modMax, modMinMax, min, modMin, stndDeviation,
        //         median, sqrtDataCount, stndError, totalDataPointsProperty, numPropertiesBeforeCal, average, multiplier, valueUnitConcluded, reconciledPerUnit,
        //         pdf, marketTrendGraph, pdfImages, customCertification, didYouPhysicallyInspectProperty,
        //         taxOverheadNotes, additionalExhibitsNotes, soilsNotes, floodMapNotes, name, improvements} = evaluation;
        //     const pdfList = pdf == null ? null : pdf.split('/');
        //     // Area filtered land data.
        //     let areaFilteredLandData = [];
        //     const sortFunction = ({salePriceNum: a, acres: acreA}, {salePriceNum: b, acres: acreB}) => (a / acreA) < (b / acreB) ? -1 : (a / acreA) > (b / acreB) ? 1 : 0;
        //     if (marketAreaType === 'EntireMarketArea') {
        //         areaFilteredLandData = landData.sort(sortFunction);
        //     }
        //     else if (marketAreaType === 'Area') {
        //         areaFilteredLandData = landData.filter((ld) => {
        //             return marketArea.counties.find((county) => county.id === ld.county.id);
        //         }).sort(sortFunction);
        //     }
        //     else {
        //         areaFilteredLandData = landData.filter((ld) => {
        //             return ld.county.id === marketArea.id
        //         }).sort(sortFunction);
        //     }
        //     // Stats Filtered.
        //     let statisticalFilteredLandData = areaFilteredLandData.filter((ld) => {
        //         const {acres, dateOfSale, salePriceNum} = ld;
        //         const mDateOfSale = moment(dateOfSale);
        //         const price = salePriceNum / acres;
        //         const maxAcres = statisticalParameters.acreageMax == null ? true : acres <= statisticalParameters.acreageMax;
        //         const minAcres = statisticalParameters.acreageMin == null ? true : acres >= statisticalParameters.acreageMin;
        //         const maxSale = statisticalParameters.dateOfSaleMax == null ? true : mDateOfSale <= moment(statisticalParameters.dateOfSaleMax);
        //         const minSale = statisticalParameters.dateOfSaleMin == null ? true : mDateOfSale >= moment(statisticalParameters.dateOfSaleMin);
        //         const saleMax = modMax === 0 ? true : price <= modMax;
        //         const saleMin = modMin === 0 ? true : price >= modMin;
        //         return maxAcres && minAcres && maxSale && minSale && saleMax && saleMin;
        //     }).sort(sortFunction);
        // 
        //     // PDF Images:
        //     let pdfImageState = {
        //         propertyPictures: [{isProcessing: false, updated: false}, {
        //             isProcessing: false,
        //             updated: false
        //         }, {isProcessing: false, updated: false}],
        //         signature: {isProcessing: false, updated: false},
        //         additionalExhibits: [{isProcessing: false, pageName: '', updated: false}, {
        //             isProcessing: false,
        //             pageName: '',
        //             updated: false
        //         }, {isProcessing: false, pageName: '', updated: false}]
        //     };
        //     if (pdfImages != null) {
        //         if (pdfImages.propertyPictures != null) {
        //             for (let i = 0; i < pdfImages.propertyPictures.length; i++) {
        //                 let pic = pdfImages.propertyPictures[i];
        //                 pdfImageState.propertyPictures[i] = {
        //                     isProcessing: false,
        //                     fileURI: pic.fileURI == null ? pic.file : pic.fileURI,
        //                     s3File: pic.file,
        //                     file: {name: `Property Picture - ${i + 1}`},
        //                     updated: false
        //                 };
        //             }
        //         }
        //         if (pdfImages.signature != null) {
        //             pdfImageState.signature = {
        //                 isProcessing: false,
        //                 updated: false,
        //                 fileURI: pdfImages.signature.fileURI == null ?  pdfImages.signature.file :  pdfImages.signature.fileURI,
        //                 s3File:  pdfImages.signature.file,
        //                 file: {name: 'Signature'}
        //             };
        //         }
        //         if (pdfImages.additionalExhibits != null) {
        //             for (let i = 0; i < pdfImages.additionalExhibits.length; i++) {
        //                 let pic = pdfImages.additionalExhibits[i];
        //                 pdfImageState.additionalExhibits[i] = {
        //                     isProcessing: false,
        //                     updated: false,
        //                     pageName: pic.pageName,
        //                     fileURI: pic.fileURI == null ? pic.file : pic.fileURI,
        //                     s3File: pic.file,
        //                     file: {name: pic.pageName}
        //                 };
        //             }
        //         }
        //     }
        // 
        //     this.state = {
        //         valuation: {
        //             modMinMax,
        //             modMax,
        //             modMin,
        //             min,
        //             max,
        //             stndDeviation,
        //             median,
        //             sqrtDataCount,
        //             stndError,
        //             average,
        //             multiplier,
        //             valueUnitConcluded,
        //             reconciledPerUnit
        //         },
        //         parameters: {
        //             marketArea: marketAreaType === 'EntireMarketArea' ? 'entireMarketArea' :
        //                 marketAreaType === 'Area' ? `area-${marketArea.id}` : `county-${marketArea.id}`,
        //             name,
        //             currentListing,
        //             currentListingPrice: currentListingPrice == null ? 0.00 : currentListingPrice,
        //             propertySoldLastThreeYears,
        //             salePrice: salePrice == null ? 0.00 : salePrice,
        //             dateSold: dateSold == null ? null : moment(dateSold),
        //             currentUse,
        //             highestAndBestUse,
        //             marketingExposureTime,
        //             landAssessmentTaxAssessor,
        //             buildingAssessmentTaxAssessor,
        //             evaluator,
        //             ownerBorrower: owner,
        //             legalPhysicalAccess,
        //             utilities,
        //             zoning,
        //             propertyRights,
        //             propertyAddress: propertyAddress.address1,
        //             propertyCity: propertyAddress.city,
        //             propertyState: propertyAddress.state,
        //             propertyPostalCode: propertyAddress.postalCode,
        //             propertyCountry: 'USA',
        //             mapParcelNumber,
        //             acres,
        //             tillable,
        //             unTillable: nonTillable,
        //             irrigationPercentage,
        //             dateOfInspection: dateOfInspection == null ? null : moment(dateOfInspection),
        //             roadFrontage: propertyRating.roadFrontage,
        //             accessFrontageEasement: propertyRating.accessFrontageEasement,
        //             accessIngressEgressQuality: propertyRating.accessIngressEgressQuality,
        //             contiguousParcels: propertyRating.contiguousParcels,
        //             topography: propertyRating.topography,
        //             soils: propertyRating.soils,
        //             drainage: propertyRating.drainage,
        //             additionalField1: propertyRating.additionalField1 == null ? {
        //                 fieldName: '',
        //                 value: null,
        //                 placeholder: 'Irrigation'
        //             } : propertyRating.additionalField1,
        //             additionalField2: propertyRating.additionalField2 == null ? {
        //                 fieldName: '',
        //                 value: null,
        //                 placeholder: 'Rivers, Creeks. Ponds'
        //             } : propertyRating.additionalField2,
        //             additionalField3: propertyRating.additionalField3 == null ? {
        //                 fieldName: '',
        //                 value: null,
        //                 placeholder: 'Marketable Timber'
        //             } : propertyRating.additionalField3,
        //             dateOfSaleMin: statisticalParameters.dateOfSaleMin == null ? null : moment(statisticalParameters.dateOfSaleMin),
        //             dateOfSaleMax: statisticalParameters.dateOfSaleMax == null ? null : moment(statisticalParameters.dateOfSaleMax),
        //             outlierPercentageExclusion: statisticalParameters.outlierPercentageExclusion == 0 ? '0' : statisticalParameters.outlierPercentageExclusion,
        //             acreageMin: nullToString(statisticalParameters.acreageMin),
        //             acreageMax: nullToString(statisticalParameters.acreageMax),
        //             customCertification,
        //             didYouPhysicallyInspectProperty: didYouPhysicallyInspectProperty == null ? false : didYouPhysicallyInspectProperty,
        //             taxOverheadNotes,
        //             additionalExhibitsNotes,
        //             floodMapNotes,
        //             soilsNotes,
        //             improvements: improvements == null ? {improvements: [], totalImprovementsValue: 0, updated: false} : Object.assign({}, improvements, {updated: false})
        //         },
        //         propertyRatingParams: {
        //             tillableFactor: ((tillable / 100)) * farmableFactor,
        //             unTillableFactor: ((nonTillable / 100)) * nonfarmableFactor,
        //             irrigationFactorResult: ((irrigationPercentage) / 100) * irrigationFactor,
        //             tillableResult: propertyRating.blendedResult + 1,
        //             blendedResult: propertyRating.blendedResult,
        //             totalSubjectScore: propertyRating.totalSubjectScore,
        //             percentageAboveBelow: propertyRating.percentageAboveBelow,
        //             reconciledOverallRating: propertyRating.reconciledOverallRating
        //         },
        //         areaFilteredLandData,
        //         statisticalFilteredLandData,
        //         marketTrendGraph: {
        //             savedScatterData: marketTrendGraph.scatterData.split('),').map((coorString) => {
        //                 const noParen = coorString.replace('(', '').replace(')', '');
        //                 const arr = noParen.split(',').map((stringNum) => parseFloat(stringNum));
        //                 return {x: arr[0], y: arr[1]}
        //             }),
        //             savedTrendData: marketTrendGraph.trendData.split('),').map((coorString) => {
        //                 const noParen = coorString.replace('(', '').replace(')', '');
        //                 const arr = noParen.split(',').map((stringNum) => parseFloat(stringNum));
        //                 return {x: arr[0], y: arr[1]}
        //             }),
        //             m: marketTrendGraph.m,
        //             b: marketTrendGraph.b,
        //             R2: marketTrendGraph.R2,
        //             scatterData: '',
        //             trendData: ''
        //         },
        //         pdfFilename: pdf == null ? null : pdfList[pdfList.length - 1],
        //         pdf,
        //         pdfImages: pdfImageState,
        //         farmableFactor,
        //         nonfarmableFactor,
        //         irrigationFactor,
        //         updated: false,
        //         evalLoaded: true
        //     }
        // }
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
        this.addImprovement = this.addImprovement.bind(this);
        this.removeImprovement = this.removeImprovement.bind(this);
        this.saveEvaluation = this.saveEvaluation.bind(this);
    }

    componentDidMount() {
        const {
            hasFetchedEvaluations,
            isFetchingEvaluations,
            organization,
            isFetchingLandData,
            landData,
            getLandData,
            counties,
            getEvals,
            orgId,
            getOrgs,
            isFetchingOrgs,
            getEvalById,
            id
            } = this.props;
        if(orgId != null && organization == null && !isFetchingOrgs) {
            getOrgs();
        }
        // if ((!hasFetchedEvaluations || isFetchingEvaluations)) {
        //     getEvals(orgId != null ? orgId : organization.id);
        // }
        getEvalById(id);
        if (landData.length === 0 && !isFetchingLandData && organization != null) {
            getLandData(counties.map((county) => county.id));
        }
        $('#deleteEvalModal').modal();
        $('#valuationModal').modal();
        $('#settingModal').modal();
    }

    componentWillUnmount(){
      $('#deleteEvalModal').modal('close');
      $('#valuationModal').modal('close');
      $('#settingModal').modal('close');

      if(this.props.orgId != null){
        this.props.clearEvalStore();
      }
    }

    componentDidUpdate(prevProps, prevState) {
        // Make this very similar to new eval but put a check in for the intial load so I am not changing anything of the existing eval.
        if (prevProps.organization == null && this.props.organization != null) {
            const {organization} = this.props;
            let farmableFactor = 1.15;
            let nonfarmableFactor = 0.75;
            let irrigationFactor = 0.00;

            if (organization != null) {
                if (organization.farmableFactor != null) {
                    farmableFactor = organization.farmableFactor;
                }
                if (organization.nonfarmableFactor != null) {
                    nonfarmableFactor = organization.nonfarmableFactor;
                }
                if (organization.irrigationFactor != null) {
                    irrigationFactor = organization.irrigationFactor;
                }
            }
            this.setState({
                farmableFactor,
                nonfarmableFactor,
                irrigationFactor
            })
        }
        const {isFetchingSingleEvaluation, isFetchingLandData, landData, organization, orgId, isFetchingOrgs, getLandData, counties} = this.props;
        if(orgId != null && isFetchingOrgs === false && prevProps.isFetchingOrgs === true){
            getLandData(counties.map((county) => county.id));
        }
        const updateState = !((prevProps.isFetchingSingleEvaluation === true && this.props.isFetchingSingleEvaluation === false) ||
        (prevProps.isFetchingLandData === true && this.props.isFetchingLandData === false) || (prevState.evalLoaded === false && this.state.evalLoaded === true) ||
        (prevProps.isFetchingSingleEvaluation === false && this.props.isFetchingSingleEvaluation === true) || (prevProps.isFetchingLandData === false && this.props.isFetchingLandData === true));
        if (((prevProps.isFetchingSingleEvaluation === true && isFetchingSingleEvaluation === false) || (prevProps.isFetchingLandData === true && isFetchingLandData === false)) && (this.props.landData.length > 0) && !this.props.isFetchingLandData && !isFetchingSingleEvaluation) {
            // Update state.
            // Populate state with Eval.
            if (cookies.get(`evaluation-${this.props.id}`) != null) {
              this.setState(cookies.get(`evaluation-${this.props.id}`))
            }
            else {

            
            let farmableFactor = 1.15;
            let nonfarmableFactor = 0.75;
            let irrigationFactor = 0.00;

            if (organization != null) {
                if (organization.farmableFactor != null) {
                    farmableFactor = organization.farmableFactor;
                }
                if (organization.nonfarmableFactor != null) {
                    nonfarmableFactor = organization.nonfarmableFactor;
                }
                if (organization.irrigationFactor != null) {
                    irrigationFactor = organization.irrigationFactor;
                }
            }
            const { evaluations, id, areas} = this.props;
            const evaluation = evaluations.find((e) => e.id === parseInt(id));
            const {marketAreaType, marketArea, currentListing, currentListingPrice, propertySoldLastThreeYears, salePriceString, salePrice, dateSold,
                currentUse, highestAndBestUse, marketingExposureTime, landAssessmentTaxAssessor, buildingAssessmentTaxAssessor, owner, propertyAddress,
                mapParcelNumber, legalPhysicalAccess, zoning, utilities, sewer, gas, power, propertyRights, propertyType, tillable, nonTillable, irrigationPercentage, acres,
                evaluator, dateOfInspection, propertyRating, statisticalParameters, max, modMax, modMinMax, min, modMin, stndDeviation,
                median, sqrtDataCount, stndError, totalDataPointsProperty, numPropertiesBeforeCal, average, multiplier, valueUnitConcluded, reconciledPerUnit,
                pdf, marketTrendGraph, pdfImages, customCertification,
                didYouPhysicallyInspectProperty, taxOverheadNotes, additionalExhibitsNotes, soilsNotes, floodMapNotes, name, improvements, pdfURI} = evaluation;
            const pdfList = pdf == null ? null : pdf.split('/');
            // Area filtered land data.
            let areaFilteredLandData = [];
            const sortFunction = ({salePriceNum: a, acres: acreA}, {salePriceNum: b, acres: acreB}) => (a / acreA) < (b / acreB) ? -1 : (a / acreA) > (b / acreB) ? 1 : 0;
            if (marketAreaType === 'EntireMarketArea') {
                areaFilteredLandData = landData.sort(sortFunction);
            }
            else if (marketAreaType === 'Area') {
                areaFilteredLandData = landData.filter((ld) => {
                    return marketArea.counties.find((county) => county.id === ld.county.id);
                }).sort(sortFunction);
            }
            else {
                areaFilteredLandData = landData.filter((ld) => {
                    return ld.county.id === marketArea.id
                }).sort(sortFunction);
            }
            // Stats Filtered.
            let statisticalFilteredLandData = areaFilteredLandData.filter((ld) => {
                const {acres, dateOfSale, salePriceNum} = ld;
                const mDateOfSale = moment(dateOfSale);
                const price = salePriceNum / acres;
                const maxAcres = statisticalParameters.acreageMax == null ? true : acres <= statisticalParameters.acreageMax;
                const minAcres = statisticalParameters.acreageMin == null ? true : acres >= statisticalParameters.acreageMin;
                const maxSale = statisticalParameters.dateOfSaleMax == null ? true : mDateOfSale <= moment(statisticalParameters.dateOfSaleMax);
                const minSale = statisticalParameters.dateOfSaleMin == null ? true : mDateOfSale >= moment(statisticalParameters.dateOfSaleMin);
                const saleMax = modMax === 0 ? true : price <= modMax;
                const saleMin = modMin === 0 ? true : price >= modMin;
                return maxAcres && minAcres && maxSale && minSale && saleMax && saleMin;
            }).sort(sortFunction);
            const tillableFactor = ((tillable / 100)) * farmableFactor;
            const unTillableFactor = ((nonTillable / 100)) * nonfarmableFactor;
            const irrigationFactorResult = ((irrigationPercentage / 100)) * irrigationFactor;

            let pdfImageState = {
                propertyPictures: [{isProcessing: false, updated: false}, {
                    isProcessing: false,
                    updated: false
                }, {isProcessing: false, updated: false}],
                signature: {isProcessing: false, updated: false},
                additionalExhibits: [{isProcessing: false, pageName: '', updated: false}, {
                    isProcessing: false,
                    pageName: '',
                    updated: false
                }, {isProcessing: false, pageName: '', updated: false}]
            };
            if (pdfImages != null) {
                if (pdfImages.propertyPictures != null) {
                    for (let i = 0; i < pdfImages.propertyPictures.length; i++) {
                        let pic = pdfImages.propertyPictures[i];
                        pdfImageState.propertyPictures[i] = Object.assign({}, pic, {
                            isProcessing: false,
                            updated: false
                        });
                    }
                }
                if (pdfImages.signature != null) {
                    pdfImageState.signature = Object.assign({}, pdfImages.signature, {
                        isProcessing: false,
                        updated: false
                    });
                }
                if (pdfImages.additionalExhibits != null) {
                    for (let i = 0; i < pdfImages.additionalExhibits.length; i++) {
                        let pic = pdfImages.additionalExhibits[i];
                        pdfImageState.additionalExhibits[i] = Object.assign({}, pic, {
                            isProcessing: false,
                            updated: false
                        });
                    }
                }
            }
            const {additionalField1, additionalField2, additionalField3} = propertyRating;
            const grossPotentialAverage = (7 + 
                (additionalField1 != null && additionalField1.value != null ? 1 : 0) + 
                (additionalField2 != null && additionalField2.value != null ? 1: 0) + 
                (additionalField3 != null && additionalField3.value != null ? 1: 0)
            ) * 5
            this.setState({
                valuation: {
                    modMinMax,
                    modMax,
                    modMin,
                    min,
                    max,
                    stndDeviation,
                    median,
                    sqrtDataCount,
                    stndError,
                    average,
                    multiplier,
                    valueUnitConcluded,
                    reconciledPerUnit
                },
                parameters: {
                    marketArea: marketAreaType === 'EntireMarketArea' ? 'entireMarketArea' :
                        marketAreaType === 'Area' ? `area-${marketArea.id}` : `county-${marketArea.id}`,
                    name,
                    currentListing,
                    currentListingPrice: currentListingPrice == null ? 0.00 : currentListingPrice,
                    propertySoldLastThreeYears,
                    salePrice: salePrice == null ? 0.00 : salePrice,
                    dateSold: dateSold == null ? null : moment(dateSold),
                    currentUse,
                    highestAndBestUse,
                    marketingExposureTime,
                    landAssessmentTaxAssessor,
                    buildingAssessmentTaxAssessor,
                    evaluator,
                    ownerBorrower: owner,
                    legalPhysicalAccess,
                    utilities,
                    sewer,
                    gas,
                    power,
                    zoning,
                    propertyType,
                    propertyRights,
                    propertyAddress: propertyAddress.address1,
                    propertyCity: propertyAddress.city,
                    propertyState: propertyAddress.state,
                    propertyPostalCode: propertyAddress.postalCode,
                    propertyState: propertyAddress.state,
                    propertyCountry: propertyAddress.country,
                    mapParcelNumber,
                    acres,
                    tillable,
                    unTillable: nonTillable,
                    irrigationPercentage,
                    dateOfInspection: dateOfInspection == null ? null : moment(dateOfInspection),
                    roadFrontage: propertyRating.roadFrontage,
                    accessFrontageEasement: propertyRating.accessFrontageEasement,
                    accessIngressEgressQuality: propertyRating.accessIngressEgressQuality,
                    contiguousParcels: propertyRating.contiguousParcels,
                    topography: propertyRating.topography,
                    soils: propertyRating.soils,
                    drainage: propertyRating.drainage,
                    additionalField1: propertyRating.additionalField1 == null ? {
                        fieldName: '',
                        value: null,
                        placeholder: 'Irrigation'
                    } : propertyRating.additionalField1,
                    additionalField2: propertyRating.additionalField2 == null ? {
                        fieldName: '',
                        value: null,
                        placeholder: 'Rivers, Creeks. Ponds'
                    } : propertyRating.additionalField2,
                    additionalField3: propertyRating.additionalField3 == null ? {
                        fieldName: '',
                        value: null,
                        placeholder: 'Marketable Timber'
                    } : propertyRating.additionalField3,
                    dateOfSaleMin: statisticalParameters.dateOfSaleMin == null ? null : moment(statisticalParameters.dateOfSaleMin),
                    dateOfSaleMax: statisticalParameters.dateOfSaleMax == null ? null : moment(statisticalParameters.dateOfSaleMax),
                    outlierPercentageExclusion: statisticalParameters.outlierPercentageExclusion == 0 ? '0' : statisticalParameters.outlierPercentageExclusion,
                    acreageMin: nullToString(statisticalParameters.acreageMin),
                    acreageMax: nullToString(statisticalParameters.acreageMax),
                    customCertification,
                    didYouPhysicallyInspectProperty,
                    taxOverheadNotes,
                    additionalExhibitsNotes,
                    floodMapNotes,
                    soilsNotes,
                    improvements: improvements == null ? {improvements: [], totalImprovementsValue: 0, updated: false} : Object.assign({}, improvements, {updated: false})
                },
                propertyRatingParams: {
                    tillableFactor,
                    unTillableFactor,
                    irrigationFactorResult,
                    tillableResult: propertyRating.blendedResult + 1,
                    blendedResult: propertyRating.blendedResult,
                    totalSubjectScore: propertyRating.totalSubjectScore,
                    percentageAboveBelow: propertyRating.percentageAboveBelow,
                    reconciledOverallRating: propertyRating.reconciledOverallRating,
                    grossPotentialAverage
                },
                areaFilteredLandData,
                statisticalFilteredLandData,
                marketTrendGraph: {
                    savedScatterData: marketTrendGraph.scatterData.split('),').map((coorString) => {
                        const noParen = coorString.replace('(', '').replace(')', '');
                        const arr = noParen.split(',').map((stringNum) => parseFloat(stringNum));
                        return {x: arr[0], y: arr[1]}
                    }),
                    savedTrendData: marketTrendGraph.trendData.split('),').map((coorString) => {
                        const noParen = coorString.replace('(', '').replace(')', '');
                        const arr = noParen.split(',').map((stringNum) => parseFloat(stringNum));
                        return {x: arr[0], y: arr[1]}
                    }),
                    m: marketTrendGraph.m,
                    b: marketTrendGraph.b,
                    R2: marketTrendGraph.R2
                },
                pdfFilename: pdf == null ? null : pdfList[pdfList.length - 1],
                pdf,
                pdfURI,
                pdfImages: pdfImageState,
                farmableFactor,
                nonfarmableFactor,
                irrigationFactor,
                updated: false,
                evalLoaded: true
            });
          }
        }
        else if (updateState) {
            // Only run this when somebody updates the state. Ignore when the initial load of evals and land data happens.
            // Need a better way to do this.
            this.propertyRatingHandler(prevState.parameters);
            this.areaFilteredLandDataHandler(prevProps, prevState);
            this.statHandler(prevState);
        }
        // Updating Images and PDFURI
        if(!isFetchingSingleEvaluation){
            const { evaluations, id} = this.props;
            const evaluation = evaluations.find((e) => e.id == id);
            if(evaluation){
                let imagesFetched = false;
                const {pdfImages} = this.state;
                const {propertyPictures, signature, additionalExhibits} = evaluation.pdfImages;
                let newPropertyPictures = pdfImages.propertyPictures
                let newSignature = pdfImages.signature
                let newAdditionalExhibits = pdfImages.additionalExhibits; 
                if(propertyPictures != null) {
                    for(let i = 0; i < propertyPictures.length; i++){
                        let propPic = propertyPictures[i];
                        let statePic = newPropertyPictures[i];
                        if(propPic.isFetching === false && statePic.isFetching === true){
                            imagesFetched = true;
                            newPropertyPictures[i] = Object.assign({}, statePic, {fileURI: propPic.fileURI, isFetching: false});
                        }
                    }
                }
                if(signature != null){
                    if(newSignature.isFetching === true && signature.isFetching === false){
                        imagesFetched = true;
                        newSignature = Object.assign({}, newSignature, {fileURI: signature.fileURI, isFetching: false});
                    }
                }
                if(additionalExhibits != null){
                    for(let i = 0; i < additionalExhibits.length; i++){
                        let propPic = additionalExhibits[i];
                        let statePic = newAdditionalExhibits[i];
                        if(propPic.isFetching === false && statePic.isFetching === true){
                            imagesFetched = true;
                            newAdditionalExhibits[i] = Object.assign({}, statePic, {fileURI: propPic.fileURI, isFetching: false});
                        }
                    }
                }
                if(imagesFetched){
                    this.setState({
                        pdfImages: {
                            propertyPictures: newPropertyPictures,
                            signature: newSignature,
                            additionalExhibits: newAdditionalExhibits
                        }
                    });
                }
                const prevEvaluation = prevProps.evaluations.find((e) => e.id == id);
                if(evaluation.pdfURI != null && (prevEvaluation == null || prevEvaluation.pdfURI == null)){
                    this.setState({
                        pdfURI: evaluation.pdfURI
                    });
                }
            }
        }
    }

    areaFilteredLandDataHandler(prevProps, prevState) {
        if ((prevState.parameters.marketArea !== this.state.parameters.marketArea)) {
            if (this.state.parameters.marketArea === 'entireMarketArea') {
                this.setState({
                    areaFilteredLandData: this.props.landData
                })
            } else if (this.state.parameters.marketArea.includes('area')) {
                const areaId = parseInt(this.state.parameters.marketArea.split('-')[1]);
                const area = this.props.areas.find((a) => a.id === areaId);
                this.setState({
                    areaFilteredLandData: this.props.landData.filter((ld) => area.counties.find((county) => county.id === ld.county.id))
                });
            } else if (this.state.parameters.marketArea.includes('county')) {
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
            const {
                parameters,
                areaFilteredLandData,
                propertyRatingParams
                } = this.state;
            const numPropertiesMarketArea = areaFilteredLandData.length;
            // Do Max, ModMax, ModMaxMin, Min, ModMin first. Then stats ld array. Then rest of stats. Then value.
            const modMinMax = parameters.outlierPercentageExclusion == '0' || numPropertiesMarketArea === 0 ? 0 :
            (parameters.outlierPercentageExclusion * numPropertiesMarketArea) / 2;
            const sortFunction = ({
                salePriceNum: a,
                acres: acreA
                }, {
                salePriceNum: b,
                acres: acreB
                }) => (a / acreA) < (b / acreB) ? -1 : (a / acreA) > (b / acreB) ? 1 : 0;
            const sortedAreaLD = areaFilteredLandData.sort(sortFunction);
            const max = areaFilteredLandData.length === 0 ? 0 : sortedAreaLD[sortedAreaLD.length - 1].salePriceNum / sortedAreaLD[sortedAreaLD.length - 1].acres;
            const modMax = modMinMax === 0 ? max : sortedAreaLD[(sortedAreaLD.length - 1) - Math.floor(modMinMax)].salePriceNum / sortedAreaLD[(sortedAreaLD.length - 1) - Math.floor(modMinMax)].acres;
            const min = areaFilteredLandData.length === 0 ? 0 : sortedAreaLD[0].salePriceNum / sortedAreaLD[0].acres;
            const modMin = modMinMax === 0 ? min : sortedAreaLD[Math.floor(modMinMax)].salePriceNum / sortedAreaLD[Math.floor(modMinMax)].acres;

            let statsFilteredLandData = areaFilteredLandData.filter((ld) => {
                const {
                    acres,
                    saleDate,
                    salePriceNum
                    } = ld;
                const mDateOfSale = moment(saleDate);
                const price = salePriceNum / acres;
                const maxAcres = parameters.acreageMax == '' ? true : acres <= parameters.acreageMax;
                const minAcres = parameters.acreageMin == '' ? true : acres >= parameters.acreageMin;
                const maxSale = parameters.dateOfSaleMax == null ? true : mDateOfSale <= parameters.dateOfSaleMax;
                const minSale = parameters.dateOfSaleMin == null ? true : mDateOfSale >= parameters.dateOfSaleMin;
                const saleMax = modMax === 0 ? true : price <= modMax;
                const saleMin = modMin === 0 ? true : price >= modMin;
                return maxAcres && minAcres && maxSale && minSale && saleMax && saleMin;
            });

            const sortedStatLD = statsFilteredLandData.sort(sortFunction);

            // Average and Standard Deviation
            const averageFunc = (nums) => {
                const sum = nums.reduce((sum, value) => {
                    return sum + value;
                }, 0);
                return sum / nums.length;
            };

            const average = averageFunc(sortedStatLD.map((ld) => ld.salePriceNum / ld.acres));

            const squareDiffs = sortedStatLD.map((value) => {
                const diff = (value.salePriceNum / value.acres) - average;
                return diff * diff;
            });

            const avgSquareDiff = averageFunc(squareDiffs);

            const stndDeviation = Math.sqrt(avgSquareDiff);

            // Median

            const medianFunc = (array) => {
                //array = array.sort();
                if (array.length % 2 === 0) { // array with even number elements
                    const left = array[array.length / 2]
                    const right = array[(array.length / 2) - 1]
                    return ((left.salePriceNum / left.acres) + (right.salePriceNum / right.acres)) / 2;
                }
                else {
                    const middleValue = array[(array.length - 1) / 2]
                    return middleValue.salePriceNum / middleValue.acres; // array with odd number elements
                }
            };
            const median = sortedStatLD.length === 0 ? 0 : medianFunc(sortedStatLD);

            // Sqrt Data Count.
            const sqrtDataCount = Math.sqrt(sortedStatLD.length);

            // Stnd Error
            const stndError = sqrtDataCount === 0 ? 0 : stndDeviation / sqrtDataCount;

            //Reconciled per unit and Value/Unit Concluded.
            const {
                reconciledOverallRating,
                percentageAboveBelow
                } = propertyRatingParams;
            const {
                acres
                } = parameters;

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
                areaFilteredLandData: sortedAreaLD,
                updated: true
            })
        }
    }

    propertyRatingHandler(prevParameters) {
        const {
            parameters,
            farmableFactor,
            nonfarmableFactor,
            irrigationFactor
            } = this.state;
        // list of fields to check for diff.
        const fields = ['roadFrontage', 'accessFrontageEasement', 'accessIngressEgressQuality', 'contiguousParcels',
            'topography', 'soils', 'drainage', 'additionalField1', 'additionalField2', 'additionalField3',
            'tillable', 'unTillable', 'irrigationPercentage'
        ];

        const shouldUpdate = fields.reduce((bool, field) => {
            if (field == 'additionalField1' || field == 'additionalField2' || field == 'additionalField3') {
                if (parameters[field]['value'] !== prevParameters[field]['value']) {
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
            const irrigationFactorResult = ((parameters.irrigationPercentage / 100)) * irrigationFactor;
            const tillableResult = tillableFactor + unTillableFactor + irrigationFactorResult;
            const blendedResult = tillableResult - 1;

            let totalCharacters = 0;

            const propertyCharacters = ['roadFrontage', 'accessFrontageEasement', 'accessIngressEgressQuality', 'contiguousParcels',
                'topography', 'soils', 'drainage', 'additionalField1', 'additionalField2', 'additionalField3'
            ];

            const totalSubjectScore = propertyCharacters.reduce((total, field) => {
                if (field == 'additionalField1' || field == 'additionalField2' || field == 'additionalField3') {
                    if (parameters[field]['value'] != null && (parameters[field]['value'] != '' || parameters[field]['value'] === 0)) {
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
                    reconciledOverallRating,
                    updated: true
                })
            });
        }
    }

    renderSpinner() {
        const {
            isFetchingLandData,
            isFetchingSingleEvaluation
            } = this.props;
        if (isFetchingLandData || isFetchingSingleEvaluation) {
            return ( <div className="overlay-spinner valign-wrapper">
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
      const {
        isSavingEvaluation,
        isPDFDownloading,
        saveProgress,
        saveProgressTotal
      } = this.props;
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
            if (field.includes('additionalField1') || field.includes('additionalField2') || field.includes('additionalField3')) {
                if (field.includes('fieldName')) {
                    let fieldName = field.split('-')[0];
                    this.setState({
                        parameters: Object.assign({}, this.state.parameters, {
                            [fieldName]: Object.assign({}, this.state.parameters[fieldName], {
                                fieldName: event.target.value
                            })
                        }),
                        updated: true
                    });
                }
                else {
                    this.setState({
                        parameters: Object.assign({}, this.state.parameters, {
                            [field]: Object.assign({}, this.state.parameters[field], {
                                value: event.target.value
                            })
                        }),
                        updated: true
                    })
                }
            }
            else {
                const target = event.target;
                const value = target.type === 'checkbox' ? target.checked : target.value;
                this.setState({
                    parameters: Object.assign({}, this.state.parameters, {
                        [field]: value instanceof Date ? moment(value) : value
                    }),
                    updated: true
                });
            }
        }
    }

    downloadPDF(saveEval = false) {
        this.props.generatePDF(Object.assign({}, this.state, {
            organization: this.props.organization,
            areas: this.props.areas,
            counties: this.props.counties,
            saveEval
        }));
    }

    updateMarketTrendGraph(data) {
        this.setState({
            marketTrendGraph: Object.assign({}, this.state.marketTrendGraph, data)
        });
    }

    validateState() {
        // This needs to be called before a submit or pdf download
        // Required Params with no Default: mapParcelNumber, propertyAddress, propertyCity, propertyState, propertyPostalCode
        const {
            parameters,
            pdfImages
            } = this.state;
        if (parameters.mapParcelNumber == null) {
            Materialize.toast('Map Parcel Number is required', 5000, 'red');
            return false;
        }
        if (parameters.propertyAddress == null) {
            Materialize.toast('Property Address is required', 5000, 'red');
            return false;
        }
        if (parameters.propertyCity == null) {
            Materialize.toast('Property City is required', 5000, 'red');
            return false;
        }
        if (parameters.propertyState == null) {
            Materialize.toast('Property State is required', 5000, 'red');
            return false;
        }
        if (parameters.propertyPostalCode == null) {
            Materialize.toast('Property Postal Code is required', 5000, 'red');
            return false;
        }
        const picturesValid = pdfImages.additionalExhibits.reduce((bool, pic) => {
            if (pic.pageName != '' && pic.fileURI == null) {
                Materialize.toast('You need to upload a photo under Additional Pictures or delete the page name.', 8000, 'red');
                return false;
            }
            if (pic.pageName == '' && pic.fileURI != null) {
                Materialize.toast('You need to add a Page Name to the file you uploaded under Additional Pictures.', 8000, 'red');
                return false;
            }
            return bool;
        }, true);
        const additionalFields = [parameters.additionalField1, parameters.additionalField2, parameters.additionalField3];
        const additionalFieldsValid = additionalFields.reduce((bool, field) => {
            if (field['fieldName'] == '' && field['value'] != null) {
                Materialize.toast('Make sure that both the Feature Name and Value are set on Additional Property Rating Fields', 8000, 'red');
                return false;
            }
            if (field['fieldName'] != '' && field['value'] == null) {
                Materialize.toast('Make sure that both the Feature Name and Value are set on Additional Property Rating Fields', 8000, 'red');
                return false;
            }
            return bool;
        }, true);
        return picturesValid && additionalFieldsValid;
    }

    submit() {
       /* if (this.state.pdfFilename === '') {
            Materialize.toast('You need a PDF filename', 5000, 'red');
            return;
        }
        */const {tillable, unTillable} = this.state.parameters;
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
        this.props.saveEvalAndPDF(Object.assign({}, this.state, {
            areas: this.props.areas,
            counties: this.props.counties,
            orgId: this.props.orgId != null ? this.props.orgId : this.props.organization.id,
            organization: this.props.organization,
            evalId: this.props.id
        }));
        $('#saveEvalModal').modal('close');
    }

    onClickSubmit() {
     //   Get Modal to pop up.
       const valid = this.validateState();
       if (valid) 
        {
            this.setState({
                pdfFilename: (moment().format('YYYY-MM-DD') + ' ' + this.state.parameters.propertyAddress + 'Eval').replace('.', '')
            });
           // $('#saveEvalModal').modal('open');
           this.submit();
        }

    }
    saveEvaluation(){
        const valid = this.validateState();
        if(valid) {
            this.props.saveEval(Object.assign({}, this.state, {orgId:  this.props.orgId != null ? this.props.orgId : this.props.organization.id, evalId: this.props.id}))
        }
    }
    onChangeFilename(event) {
        this.setState({
            pdfFilename: event.target.value.replace('.', '')
        });
    }

    onPDFImagesChange(type, index = null) {
        return (event) => {
            const file = event.target.files[0];
            if (file != null) {
                if (type === 'signature') {
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
                                if (index === i) {
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
                    if (type === 'signature') {
                        this.setState({
                            pdfImages: Object.assign({}, this.state.pdfImages, {
                                signature: Object.assign({}, this.state.pdfImages.signature, {
                                    isProcessing: false,
                                    fileURI: upload.target.result,
                                    updated: true,
                                    s3Image: ''
                                })
                            }),
                            updated: true
                        });
                    }
                    else {
                        this.setState({
                            pdfImages: Object.assign({}, this.state.pdfImages, {
                                [type]: this.state.pdfImages[type].map((pic, i) => {
                                    if (index === i) {
                                        return Object.assign({}, pic, {
                                            isProcessing: false,
                                            fileURI: upload.target.result,
                                            updated: true,
                                            s3Image: ''
                                        })
                                    }
                                    return pic;
                                })
                            }),
                            updated: true
                        })
                    }
                };
                reader.readAsDataURL(file);
            }
        }
    }

    clearPDFImages(type, index = null) {
        return () => {
            if (type === 'signature') {
                this.setState({
                    pdfImages: Object.assign({}, this.state.pdfImages, {
                        signature: Object.assign({}, this.state.pdfImages.signature, {
                            isProcessing: false,
                            file: null,
                            fileURI: null,
                            updated: true,
                            s3Image: ''
                        })
                    }),
                    updated: true
                });
            }
            else {
                this.setState({
                    pdfImages: Object.assign({}, this.state.pdfImages, {
                        [type]: this.state.pdfImages[type].map((pic, i) => {
                            if (index === i) {
                                return Object.assign({}, pic, {
                                    isProcessing: false,
                                    file: null,
                                    fileURI: null,
                                    updated: true,
                                    s3Image: ''
                                });
                            }
                            return pic;
                        })
                    }),
                    updated: true
                });
            }
        }
    }

    additionalExhibitsNameChange(index) {
        return (event) => {
            this.setState({
                pdfImages: Object.assign({}, this.state.pdfImages, {
                    additionalExhibits: this.state.pdfImages.additionalExhibits.map((pic, i) => {
                        if (index === i) {
                            return Object.assign({}, pic, {
                                pageName: event.target.value,
                                updated: true
                            })
                        }
                        return pic;
                    })
                }),
                updated: true
            });
        }
    }

    onClickDelete(){
      $('#deleteEvalModal').modal('open');
    }

    addImprovement(params) {
        const improvements = this.state.parameters.improvements.improvements.concat(params);
        this.setState({
            parameters: Object.assign({}, this.state.parameters, {
                improvements: {
                    improvements,
                    totalImprovementsValue: improvements.reduce((sum, i) => i.valueUnitCalculation + sum, 0),
                    updated: true
                }
            }),
            updated: true
        });
    }

    removeImprovement(index) {
        const improvements = this.state.parameters.improvements.improvements.filter((improvement, i) => i !== index);
        this.setState({
            parameters: Object.assign({}, this.state.parameters, {
                improvements: {
                    improvements,
                    totalImprovementsValue: improvements.reduce((sum, i) => i.valueUnitCalculation + sum, 0),
                    updated: true
                }
            }),
            updated: true
        });
    }

    render() {
        const title = this.state.parameters.mapParcelNumber + ' ' + (this.state.parameters.name == null || this.state.parameters.name == '' ? this.state.parameters.propertyAddress :this.state.parameters.name);
        return (
            <div className="col s12 row">
                {this.renderSpinner()}
                {this.renderProgressBar()}
                <SaveEvaluationModal filename={this.state.pdfFilename} onChangeFilename={this.onChangeFilename}
                                     submit={this.submit} exisitng={true}/>
                <div className="modal" id="deleteEvalModal">
                  <div className="modal-content">
                      <h4>Delete Evaluation</h4>
                      <p>Are you sure you want to delete this evaluation?</p>
                  </div>
                  <div className="modal-footer">
                    <a onClick={() => this.props.deleteEval(this.props.id)} className="btn-flat red-text"><i className="material-icons left">delete_forever</i> Delete</a>
                    <a className="modal-close modal-action btn-flat"><i className="material-icons left">cancel</i>Cancel</a>
                  </div>
                </div>
                <div className="modal scroll-modal" id="settingModal">
                <Settings/>
                </div>   
                <EvaluationParameters parameters={this.state.parameters}
                                      orgName={this.props.organization == null ? '' : this.props.organization.name}
                                      address={this.props.organization == null ? {} : this.props.organization.address}
                                      counties={this.props.counties}
                                      areas={this.props.areas} onParametersChange={this.onParametersChange}
                                      propertyRatingParams={this.state.propertyRatingParams}
                                      farmableFactor={this.state.farmableFactor}
                                      nonfarmableFactor={this.state.nonfarmableFactor}
                                      irrigationFactor={this.state.irrigationFactor}
                                      existing={true} beginningPopulation={this.state.areaFilteredLandData.length}
                                      afterCalibration={this.state.statisticalFilteredLandData.length}
                                      pdfImages={this.state.pdfImages}
                                      additionalExhibitsNameChange={this.additionalExhibitsNameChange}
                                      clearPDFImages={this.clearPDFImages} onPDFImagesChange={this.onPDFImagesChange}
                                      addImprovement={this.addImprovement} removeImprovement={this.removeImprovement}
                                      saveEvaluation={this.saveEvaluation} onClickSubmit={this.onClickSubmit}/>
            <div className="modal scroll-modal" id="valuationModal">
                <ValuationSummary valuation={this.state.valuation}
                                  propertyRating={this.state.propertyRatingParams.reconciledOverallRating}
                                  acres={this.state.parameters.acres}
                                  scatterData={this.state.statisticalFilteredLandData} downloadPDF={this.downloadPDF}
                                  updateMarketTrendGraph={this.updateMarketTrendGraph}
                                  onClickSubmit={this.onClickSubmit}
                                  existing={true} updated={this.state.updated}
                                  savedScatterData={this.state.marketTrendGraph.savedScatterData}
                                  savedTrendData={this.state.marketTrendGraph.savedTrendData}
                                  m={this.state.marketTrendGraph.m} b={this.state.marketTrendGraph.b}
                                  R2={this.state.marketTrendGraph.R2} pdf={this.state.pdf} onClickDelete={this.onClickDelete}
                                  improvements={this.state.parameters.improvements} saveEvaluation={this.saveEvaluation}
                                  title={title}/>
            </div>                      
            </div>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(EvaluationContainer)
