/**
 * Created by geoff on 1/22/2018.
 */

//import * as rasterizeHTML from 'rasterizehtml';
//import html2canvas from 'html2canvas'
//import jsPDF from 'jspdf'
//import html2pdf from 'html2pdf.js';
import {numToCurrency, precisionRounding, exportHTMLToPDF} from '../helpers'
import moment from 'moment'

//window.html2canvas = html2canvas;
//window.rasterizeHTML = rasterizeHTML;

const generatePDF = async (params, filename, saveEval, existingEval, incrementSaveProgress, action) => {
    console.log('Generating PDF.');
    //const pdf = new jsPDF();
    //var canvas = pdf.canvas;
    //canvas.height = 72 * 11;
    //canvas.width = 72 * 8.5;
    let headerStyle = null;
    let primaryColor = null;
    const totalImprovementsValue = params.parameters.improvements != null ? params.parameters.improvements.totalImprovementsValue : 0;
    const totalValueUnitConcluded = params.valuation.valueUnitConcluded + totalImprovementsValue;
    if(params.organization.primaryColor != null) {
      primaryColor = params.organization.primaryColor;
      headerStyle = `background-color: rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, ${primaryColor.a});`
    }
    let pages = []
    const pageHeight = ($(window).height()) * 0.75;
    const pageCSS = ``
    const page1 = `
    <div class="pdf-container row" style="${pageCSS}">
        <div class="col s10 offset-s1 pdf-box">
            <div class="row pdf-border-bottom col s12 ${headerStyle == null ? 'e-value-green' : ''}" style="height: 5rem; ${headerStyle == null ? '' : headerStyle}">
            </div>
            <div class="row">
                <h4 class="center">Evaluation Report</h4>
            </div>
            <br/>
            <div class="row">
                <p class="center"><b>Prepared for:</b></p>
            </div>
            <div class="row">
                <p class="center">${params.organization.name}</p>
            </div>
            <div class="row">
                <p class="center">${params.organization.address.address1}</p>
            </div>
            <div class="row">
                <p class="center">${params.organization.address.city}, ${params.organization.address.state} ${params.organization.address.postalCode}</p>
            </div>
            <br/>
            <div class="row">
                <p class="center"><b>For Property Located At:</b></p>
            </div>
            <div class="row">
                <p class="center">${params.parameters.propertyAddress}</p>
            </div>
            <div class="row">
                <p class="center">${params.parameters.propertyCity}, ${params.parameters.propertyState} ${params.parameters.propertyPostalCode}</p>
            </div>
            ${params.organization.logo != null ? `<div class="row"><div class="center"><img class="center" src="${params.organization.logo.fileURI}" style="max-width: auto; max-height: 16rem" /></div></div>` : ''}
        </div>
    </div><div class="html2pdf__page-break"></div>
    `;
    pages.push(page1);

    const page2 = `
    <div class="pdf-container row" style="${pageCSS}">
        <div class="pdf-box col s10 offset-s1">
            <div class="row pdf-border-bottom col s12 ${headerStyle == null ? 'e-value-green' : ''}" style="${headerStyle == null ? '' : headerStyle}">
                <h5 class="center white-text">Summary of Value Estimate</h5>
            </div>
            <div class="row pdf-border-bottom col s12" >
                <p class="pdf-paragraph">
                    At your request, the attached report of our evaluation of the referenced property is submitted.
                    The purpose of this evaluation is to estimate the “as is” market value  of the subject property,
                    as of the effective date of value, ${params.parameters.dateOfInspection == null ? moment().format('MMMM DD YYYY') : params.parameters.dateOfInspection.format('MMMM DD YYYY')}. This report sets forth our opinion of market
                    value along with supporting data and reasoning which form the basis of our opinion.
                    It should also be noted that this evaluation is based upon a scope of work deemed appropriate based
                    upon the parameters of the assignment.  Therefore, based on the inspection of the property and the
                     investigation and analyses undertaken, the estimated “as is” market value of the fee simple
                     interest in the subject property, as of ${params.parameters.dateOfInspection == null ? moment().format('MMMM DD YYYY') : params.parameters.dateOfInspection.format('MMMM DD YYYY')}, is:
                </p>
            </div>
            <div class="pdf-border-bottom row col s12">
                <div class="row">
                    <h6 class="center"><b>“As Is” Market Value Opinion, As of ${params.parameters.dateOfInspection == null ? moment().format('MMMM DD YYYY') : params.parameters.dateOfInspection.format('MMMM DD YYYY')}</b></h5>
                </div>
                <div class="row">
                    <h6 class="center"><b>${numToCurrency(precisionRounding(totalValueUnitConcluded, -3))}</b></h5>
                </div>
            </div>
            <div class="pdf-border-bottom row col s12">
                <p class="pdf-paragraph">
                <b>DATA</b>:  Based upon the physical and locational characteristics of the subject property,
                an appropriate set of comparable market data has been included for analysis. Data sources include a
                combination of an internal database as well as additional data from public and private data providers.
                </p>
            </div>
            <div class="pdf-border-bottom row col s12">
               <p class="pdf-paragraph">
                    <b>EVALUATION DETAIL</b>:  Unlike most traditional valuation reports that typically include 3 to 5
                sales, this model utilizes a much larger dataset as found in statistical modeling. In statistical modeling
                a population sample with a minimum of 30 data points is desired when possible. Therefore, when possible,
                this evaluation includes at least 30 data points (comparable sales). Though the mean may or may not be the
                most meaningful indicator (in this case, an indication of market value) individual data points as well as
                the overall data's relationship to the mean, yields important information that narrows the results to a
                likely conclusion. The overall process is a combination of an internally developed evaluation model driven
                by MS Excel, coupled with the evaluator's analysis of the results. The details of this process includes:
                1. comparing various samples of the population. 2. reducing the final sample to the most meaningful data.
                3. calibrating the data by removing extreme outliers. 4. ranking multiple property characters of the
                subject as compared to the market. 5. deriving a conclusion of the subject's overall place within the market.
               </p>
            </div>
            <div class="row col s12">
            <p class="pdf-paragraph">
            <b>VALUE CONCLUSIONS</b>: The  subject's overall property rating adjustment, which is statistically
            measured as comparded to the average, is added to the  market mean in order to determine the final
            estimate of value.  The adjustment to the average is made based upon the overall quality rating of the
            subject, relative to the data field. In this instance, the subject “ranks”  above average as compared to
            the market. This conclusion places the subject in the top 43.40% of the market based on the final dataset
            of ${params.statisticalFilteredLandData.length} properties. The overall final value is derived by adding/subtracting the final property rating to/from
            the statistical mean.
            </p>
            </div>
        </div>
        </div><div class="html2pdf__page-break"></div>`;
        pages.push(page2)

    // This is taking too long and isn't working. I am just going to copy the info.
    let marketArea = 'Entire Market Area';
    if(params.parameters.marketArea.includes('area')){
        let areaId = parseInt(params.parameters.marketArea.split('-')[1]);
        marketArea = params.areas.find((area) => {
            return area.id === areaId;
        }).name;
    }
    else if (params.parameters.marketArea.includes('county')){
        let countyId = parseInt(params.parameters.marketArea.split('-')[1]);
        marketArea = params.areas.find((county) => {
            return county.id === countyId;
        }).county;
    }
    const page3 = `
    <div class="pdf-container row" style="${pageCSS}">
    <div class="col s10 offset-s1 pdf-box">
        <div class="row pdf-border-bottom col s12 ${headerStyle == null ? 'e-value-green' : headerStyle}"
        style="margin-bottom: 0; padding-bottom: 0; ${headerStyle == null ? '' : headerStyle}">
                <h5 class="center white-text">Real Estate Evaluation</h5>
        </div>
        <div class="row pdf-border-bottom grey col s12" style="margin-top: 0; padding-top: 0;">
             <h5 class="center white-text">Summary</h5>
        </div>
        <div class="row pdf-site-summary">
            <div class="row">
                <div class="col s6">
                  <div class="col s6">

                      <p><b>Owner or Borrower</b>:</p>

                  </div>
                  <div class="col s6">

                      <p>${params.parameters.ownerBorrower}</p>

                  </div>
                </div>
                <div class="col s6">
                  <div class="col s6">
                      <p><b>Property Address</b>:</p>
                  </div>
                  <div class="col s6">
                      <p>${params.parameters.propertyAddress == null ? 'N/A' : params.parameters.propertyAddress}
                      ${params.parameters.propertyCity == null ? 'N/A' : params.parameters.propertyCity},
                      ${params.parameters.propertyState == null ? 'N/A' : params.parameters.propertyState}
                      ${params.parameters.propertyPostalCode == null ? 'N/A' : params.parameters.propertyPostalCode}</p>
                  </div>
                </div>
            </div>
            <div class="row">
                <div class="col s6">
                    <div class="col s6">
                        <p><b>Map Parcel Number</b>:</p>
                    </div>
                    <div class="col s6">
                    <p>${params.parameters.mapParcelNumber}</p>
                    </div>
                </div>
                <div class="col s6">
                    <div class="col s6">
                    <p><b>Legal & Physical Access</b>:</p>
                    </div>
                    <div class="col s6">
                    <p>${params.parameters.legalPhysicalAccess ? 'Yes' : 'No'}</p>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col s6">
                    <div class="col s6">
                    <p><b>Zoning</b>:</p>
                    </div>
                    <div class="col s6">
                    <p>${params.parameters.zoning == null || params.parameters.zoning == '' ? 'N/A' : params.parameters.zoning}</p>
                    </div>
                </div>
                <div class="col s6">
                    <div class="col s6">
                    <p><b>Utilities</b>:</p>
                    </div>
                    <div class="col s6">
                    <p>${params.parameters.utilities == null || params.parameters.utilities == '' ? 'N/A' : params.parameters.utilities}</p>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col s6">
                    <div class="col s6">
                    <p><b>Property Rights</b>:</p>
                    </div>
                    <div class="col s6">
                    <p>${params.parameters.propertyRights == null || params.parameters.propertyRights == '' ? 'N/A' : params.parameters.propertyRights}</p>
                    </div>
                </div>
                <div class="col s6">
                    <div class="col s6">
                    <p><b>Property Type</b>:</p>
                    </div>
                    <div class="col s6">
                    <p>Agricultural Land</p>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col s6">
                    <div class="col s6">
                    <p><b>Evaluator</b>:</p>
                    </div>
                    <div class="col s6">
                    <p>${params.parameters.evaluator == null || params.parameters.evaluator == '' ? 'N/A' : params.parameters.evaluator}</p>
                    </div>
                </div>
                <div class="col s6">
                    <div class="col s6">
                    <p><b>Date of Value</b>:</p>
                    </div>
                    <div class="col s6">
                    <p>${params.parameters.dateOfInspection == null ? moment().format('MMMM DD YYYY') : params.parameters.dateOfInspection.format('MMMM DD YYYY')}</p>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col s6">
                    <div class="col s6">
                    <p><b>Current Listing</b>:</p>
                    </div>
                    <div class="col s6">
                    <p>${params.parameters.currentListing ? 'Yes' : 'No'}</p>
                    </div>
                </div>
                <div class="col s6">
                    <div class="col s6">
                    <p><b>Property Sold in Last 3 years</b>:</p>
                    </div>
                    <div class="col s6">
                    <p>${params.parameters.propertySoldLastThreeYears ? 'Yes' : 'No'}</p>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col s6">
                    <div class="col s6">
                    <p><b>Contract Price</b>:</p>
                    </div>
                    <div class="col s6">
                    <p>${params.parameters.currentListingPrice == null || params.parameters.currentListingPrice == '' ? 'N/A' : numToCurrency(params.parameters.currentListingPrice)}</p>
                    </div>
                </div>
                <div class="col s6">
                    <div class="col s6">
                    <p><b>Sale Price</b>:</p>
                    </div>
                    <div class="col s6">
                    <p>${params.parameters.salePrice == null || params.parameters.salePrice == '' ? 'N/A' : numToCurrency(params.parameters.salePrice)}</p>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col s6">
                  <div class="col s6">
                  <p><b>Date Sold</b>:</p>
                  </div>
                </div>
                <div class="col s6">
                  <div class="col s6">
                  <p>${params.parameters.dateSold == null ? 'N/A' : params.parameters.dateSold.format('YYYY-MM-DD')}</p>
                  </div>
                </div>
            </div>
            <div class="row">
                <div class="col s6">
                    <div class="col s6">
                    <p><b>Current Use</b>:</p>
                    </div>
                    <div class="col s6">
                    <p>${params.parameters.currentUse == null || params.parameters.currentUse == ''? 'N/A' : params.parameters.currentUse}</p>
                    </div>
                </div>
                <div class="col s6">
                    <div class="col s6">
                    <p><b>Highest And Best Use</b>:</p>
                    </div>
                    <div class="col s6">
                    <p>${params.parameters.highestAndBestUse == null || params.parameters.highestAndBestUse == ''? 'N/A' : params.parameters.highestAndBestUse}</p>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col s6">
                    <div class="col s6">
                    <p><b>Market Exposure Time</b>:</p>
                    </div>
                    <div class="col s6">
                    <p>${params.parameters.marketingExposureTime == null || params.parameters.marketingExposureTime == '' ? 'N/A' : params.parameters.marketingExposureTime}</p>
                    </div>
                </div>
                <div class="col s6">
                    <div class="col s6">
                    <p><b>Land Assessment</b>:</p>
                    </div>
                    <div class="col s6">
                    <p>${params.parameters.landAssessmentTaxAssessor == null || params.parameters.landAssessmentTaxAssessor == ''? 'N/A' : numToCurrency(params.parameters.landAssessmentTaxAssessor)}</p>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col s6">
                    <div class="col s6">
                    <p><b>Building Assessment</b>:</p>
                    </div>
                    <div class="col s6">
                    <p>${params.parameters.buildingAssessmentTaxAssessor == null || params.parameters.buildingAssessmentTaxAssessor == ''? 'N/A' : numToCurrency(params.parameters.buildingAssessmentTaxAssessor)}</p>
                    </div>
                </div>
                <div class="col s6">
                    <div class="col s6">
                    <p><b>Acres</b>:</p>
                    </div>
                    <div class="col s6">
                    <p>${params.parameters.acres}</p>
                    </div>
                </div>
            </div>
            <div class="row" style="margin-bottom: 10px;">
                <div class="col s4">
                    <div class="col s6">
                    <p><b>Farmable</b>:</p>
                    </div>
                    <div class="col s6">
                    <p>${params.parameters.tillable}%</p>
                    </div>
                </div>
                <div class="col s4">
                    <div class="col s6">
                    <p><b>Non-Farmable</b>:</p>
                    </div>
                    <div class="col s6">
                    <p>${params.parameters.unTillable}%</p>
                    </div>
                </div>
                <div class="col s4">
                    <div class="col s6">
                      <p><b>Irrigation</b>:</p>
                    </div>
                    <div class="col s6">
                      <p>${params.parameters.irrigationPercentage}</p>
                    </div>
                </div>
            </div>
            <div class="row"  style="margin-bottom: 10px;">
                <div class="col s6">
                <div class="col s6">
                <p><b>Market Area</b>:</p>
                </div>
                </div>
                <div class="col s6">
                <div class="col s6">
                <p>${marketArea}</p>
                </div>
                </div>
            </div>
        </div>
    </div>
    </div><div class="html2pdf__page-break"></div>
    `;
    pages.push(page3);

    const page4 = `
    <div class="pdf-container row" style="${pageCSS}">
        <div class="pdf-box col s10 offset-s1">
        <div class="row pdf-border-bottom col s12 ${headerStyle == null ? 'e-value-green' : ''}"
        style="margin-bottom: 0; padding-bottom: 0; ${headerStyle == null ? '' : headerStyle}">
                <h5 class="center white-text">Real Estate Evaluation</h5>
        </div>
        <div class="row pdf-border-bottom grey col s12" style="margin-top: 0; padding-top: 0;">
             <h5 class="center white-text">Statistical Parameters</h5>
        </div>
        <div class="row">
            <div class="row">
                <div class="col s4 offset-s4">
                <p>Min</p>
                </div>
                <div class="col s4">
                <p>Max</p>
                </div>
            </div>
            <div class="row">
                <div class="col s4">
                <p><b>Acreage</b>:</p>
                </div>
                <div class="col s4">
                <p>${params.parameters.acreageMin}</p>
                </div>
                <div class="col s4">
                <p>${params.parameters.acreageMax}</p>
                </div>
            </div>
            <div class="row">
                <div class="col s4">
                <p><b>Date of Sale</b>:</p>
                </div>
                <div class="col s4">
                <p>${params.parameters.dateOfSaleMin == null ? 'N/A' : params.parameters.dateOfSaleMin.format('YYYY-MM-DD')}</p>
                </div>
                <div class="col s4">
                <p>${params.parameters.dateOfSaleMax == null ? 'N/A' : params.parameters.dateOfSaleMax.format('YYYY-MM-DD')}</p>
                </div>
            </div>
            <div class="row">
                <div class="col s4">
                <p><b>Outlier Percentage Exclusion</b>:</p>
                </div>
                <div class="col s4 offset-s4">
                <p>${params.parameters.outlierPercentageExclusion * 100}%</p>
                </div>
            </div>
        </div>
        </div>
    </div><div class="html2pdf__page-break"></div>
    `;
    pages.push(page4);

    const allCheckedCheckBoxes = $('input[type=checkbox]:checked');
    allCheckedCheckBoxes.attr('checked', 'checked');
    if(primaryColor != null){
      $('.table-section-header').css('background-color', `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, ${primaryColor.a})`);
    }

    const propertyRating1 = $('#property-rating-1');
    const page5 = `
    <div class="pdf-container row" style="${pageCSS}">
    <div class="pdf-box col s10 offset-s1">
    <div class="row pdf-border-bottom col s12 ${headerStyle == null ? 'e-value-green' : ''}"
      style="margin-bottom: 0; padding-bottom: 0; ${headerStyle == null ? '' : headerStyle}">
                <h5 class="center white-text">Real Estate Evaluation</h5>
        </div>
        <div class="row pdf-border-bottom grey col s12" style="margin-top: 0; padding-top: 0; marign-bottom: 0; padding-bottom: 0;">
             <h5 class="center white-text">Property Rating (1)</h5>
        </div>
        ${propertyRating1.html()}
    </div>
    </div><div class="html2pdf__page-break"></div>
    `;
    pages.push(page5);

    const propertyRating2 = $('#property-rating-2');
    const page6 = `
    <div class="pdf-container row" style="${pageCSS}">
    <div class="pdf-box col s10 offset-s1">
     <div class="row pdf-border-bottom col s12 ${headerStyle == null ? 'e-value-green' : ''}"
        style="margin-bottom: 0; padding-bottom: 0; ${headerStyle == null ? '' : headerStyle}">
                <h5 class="center white-text">Real Estate Evaluation</h5>
        </div>
        <div class="row pdf-border-bottom grey col s12" style="margin-top: 0; padding-top: 0;">
             <h5 class="center white-text">Property Rating (2)</h5>
        </div>
        ${propertyRating2.html()}
        <div class="row">
            <p className="pdf-paragraph">
            The table above contains calculations that measure qualitative assessments, which result in quantitative application. Each property characteristic 
            has a possible score from “0” (Highly Inferior) to “10” (Highly Superior) with “5” being “Average.” The totals from all of the property’s character ratings, 
            in this case ${params.propertyRatingParams.totalSubjectScore}, are measured against the gross potential average score (total number or property characters’ times the average score, in this case 
            ${params.propertyRatingParams.grossPotentialAverage}
            </p>
        </div>
    </div>
    </div><div class="html2pdf__page-break"></div>
    `;

    pages.push(page6);



    const page7 = `
    <div class="pdf-container row" style="${pageCSS}">
    <div class="pdf-box col s10 offset-s1">
       <div class="row pdf-border-bottom col s12 ${headerStyle == null ? 'e-value-green' : ''}"
          style="margin-bottom: 0; padding-bottom: 0; ${headerStyle == null ? '' : headerStyle}">
                <h5 class="center white-text">Statistical Factors</h5>
        </div>
        <div class="row">
            <div class="row">
                <div class="col s6">
                    <p><b>Min</b>:</p>
                </div>
                <div class="col s6">
                    <p>${params.valuation.modMin == null ? 'N/A' : numToCurrency(precisionRounding(params.valuation.modMin, 0))}</p>
                </div>
            </div>
            <div class="row">
                <div class="col s6">
                    <p><b>Max</b>:</p>
                </div>
                <div class="col s6">
                    <p>${params.valuation.modMax == null ? 'N/A' : numToCurrency(precisionRounding(params.valuation.modMax, 0))}</p>
                </div>
            </div>
            <div class="row">
                <div class="col s6">
                    <p><b>Standard Deviation</b>:</p>
                </div>
                <div class="col s6">
                    <p>${params.valuation.stndDeviation == null ? 'N/A' : numToCurrency(precisionRounding(params.valuation.stndDeviation, 0))}</p>
                </div>
            </div>
            <div class="row">
                <div class="col s6">
                    <p><b>Median</b>:</p>
                </div>
                <div class="col s6">
                    <p>${params.valuation.median == null ? 'N/A' : numToCurrency(precisionRounding(params.valuation.median, 0))}</p>
                </div>
            </div>
            <div class="row">
                <div class="col s6">
                    <p><b>Average</b>:</p>
                </div>
                <div class="col s6">
                    <p>${params.valuation.average == null ? 'N/A' : numToCurrency(precisionRounding(params.valuation.average, 0))}</p>
                </div>
            </div>
            <div class="row">
                <div class="col s6">
                    <p><b>Total Beginning Population</b>:</p>
                </div>
                <div class="col s6">
                    <p>${params.areaFilteredLandData.length}</p>
                </div>
            </div>
            <div class="row">
                <div class="col s6">
                    <p><b>Total After Calibration</b>:</p>
                </div>
                <div class="col s6">
                    <p>${params.statisticalFilteredLandData.length}</p>
                </div>
            </div>
        </div>
    </div>
    </div><div class="html2pdf__page-break"></div>
    `;

    pages.push(page7);

    const valuationSummary = $('#valuation-summary');
    const page8 = `
    <div class="pdf-container row" style="${pageCSS}">
    <div class="pdf-box col s10 offset-s1">
         <div class="row pdf-border-bottom col s12 ${headerStyle == null ? 'e-value-green' : ''}"
              style="margin-bottom: 0; padding-bottom: 0; ${headerStyle == null ? '' : headerStyle}">
                <h5 class="center white-text">Valuation</h5>
        </div>
        ${valuationSummary.html()}
    </div>
    </div><div class="html2pdf__page-break"></div>
    `;

   pages.push(page8);

    const graph = $('div.VictoryContainer > svg').attr("version", 1.1).attr("xmlns", "http://www.w3.org/2000/svg").attr('xmlns:xlink', "http://www.w3.org/1999/xlink").attr('xml:space', 'preserve').attr('width', 625).attr('height', 625); // get the svg that the graph is rendered in.
    const svgString = new XMLSerializer().serializeToString(graph[0]);
    const DOMURL = self.URL || self.webkitURL || self;
    const svg = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
    const svgURL = DOMURL.createObjectURL(svg);
    const page9 = `
    <div class="pdf-container row" style="${pageCSS}">
      <div class="pdf-box col s10 offset-s1">
        <div class="row pdf-border-bottom col s12 ${headerStyle == null ? 'e-value-green' : ''}"
              style="margin-bottom: 0; padding-bottom: 0; ${headerStyle == null ? '' : headerStyle}">
        <h5 class="center white-text">Comment Page</h5>
        </div>
        <div class="row pdf-border-bottom">
          <p class="pdf-paragraph">
            The valuation process within this report is based on a statistical analysis approach
            that includes mass sales transaction data gathered from public sources including but
            not limited to public tax assessor records as well as other primary and secondary data
            sources maintained by this organization. The accuracy and reasonableness of valuation
            results are also carefully monitored by internal analysts as well as external quality control
            valuation reviewers. </p>
        </div>
        <div class="row pdf-border-bottom">
          <p class="pdf-paragraph">There were ${params.areaFilteredLandData.length} properties originally included in the comparable set. When the average
          is greatly affected by either extremely high or low data-points, the calibration tool is utilized in
          order to remove these outliers from the range. In this case, it was considered necessary to remove a portion
          of the data-points. Therefore, the total number of data-points analyzed is ${params.statisticalFilteredLandData.length}. This dataset is applicable in estimating
          the most probable market value of the subject.</p>
        </div>
        <div class="row pdf-border-bottom">
          <p class="pdf-paragraph">The mass data conclusion is calibrated in several instances in order to reflect
          the most probable value. These calibrations are based on market data that indicates the appropriate multipliers
          (adjustments) for various factors. </p>
        </div>
        <div class="row">
          <div class="center">
            <h3 class="center grey-text" style="margin-bottom: 0;">Market Trends</h3>
            <img src="${svgURL}" class="responsive-img"/>
          </div>
        </div>
      </div>
    </div><div class="html2pdf__page-break"></div>
    `;
    pages.push(page9);

    const defaultCertification =
    `<div class="row pdf-border-bottom">
      <p class="pdf-paragraph">1. The facts and date reported by the valuator and used in the valuation process are true and correct. </p
    </div>
    <div class="row pdf-border-bottom">
      <p class="pdf-paragraph">2. I have no present or prospective interest in the property that is the subject of this report, and no personal interest with respect to the parties involved.</p
    </div>
    <div class="row pdf-border-bottom">
      <p class="pdf-paragraph">
         3. I have no bias with respect to the property that is the subject of this report or to the parties involved with this assignment.
      </p>
    </div>
    <div class="row pdf-border-bottom">
    <p class="pdf-paragraph">
         4.My compensation is not contingent upon the reporting of a predetermined value or direction in value that favors
         the cause of the client, the amount of the value estimate, the attainment of a stipulated result, or the occurrence of a
          subsequent event.
    </p>
    </div>
    <div class="row pdf-border-bottom">
    <p class="pdf-paragraph">
         5. I have made a personal inspection of the property that is the subject of this report. <span style="padding-left: 0; margin-left: 0; margin-right: 2rem;" class="badge ${params.parameters.didYouPhysicallyInspectProperty ? 'new' : 'new red'}" data-badge-caption="${params.parameters.didYouPhysicallyInspectProperty ? 'Yes' : 'No'}"></span>
    </p>
    </div>
    <div class="row pdf-border-bottom">
    <p class="pdf-paragraph">
           6. Unless otherwise stated, no one provided significant assistance in the valuation process to the person signing this certification.
    </p>
    </div>
    <div class="row pdf-border-bottom">
    <p class="pdf-paragraph">
      7. As of the date of this valuation, I have completed all of the required training by this institution in order to be considered a competent in valuation proceedures.
    </p>
    </div>`;

    const page10 = `
    <div class="pdf-container row" style="${pageCSS}">
      <div class="pdf-box col s10 offset-s1">
      <div class="row pdf-border-bottom col s12 ${headerStyle == null ? 'e-value-green' : headerStyle}"
            style="margin-bottom: 0; padding-bottom: 0; ${headerStyle == null ? '' : headerStyle}">
        <h5 class="center white-text">Certification</h5>
      </div>
      ${params.parameters.customCertification == null || params.parameters.customCertification == '' ? defaultCertification : `<div class="row pdf-border-bottom" style="max-height: 35rem;"><div class="col s12"><p class="pdf-paragraph line-break">${params.parameters.customCertification}</p></div></div>`}
      <div class="row pdf-border-bottom">
        <div class="col s3 offset-s3" >
        <p><b>Name</b></p>
        </div>
        <div class="col s3" >
        <p><b>Signature</b></p>
        </div>
        <div class="col s3" >
        <p><b>Date</b></p>
        </div>
      </div>
      <div class="row pdf-border-bottom">
        <div class="col s3">
          <p class="pdf-paragraph">Valuator</p>
        </div>
        <div class="col s3">
          <p>${params.parameters.evaluator == '' || params.parameters.evaluator == null ? '' : params.parameters.evaluator}</p>
        </div>
        <div class="col s3">
          ${params.s3Images.signature != null ? `<img style="max-width: 10rem; height: auto;" src="${params.s3Images.signature.fileURI}"/>`: ''}
        </div>
        <div class="col s3">
          <p>${params.parameters.dateOfInspection != null ? params.parameters.dateOfInspection.format('MM/DD/YYYY') : ''}</p>
        </div>
      </div>
      <div className="row">
        <div class="col s6">
          <p class="pdf-paragraph">Did you physically inspect the subject property(ies)?</p>
        </div>
        <div class="col s6">
          <div class="col s6"><span class="left badge ${params.parameters.didYouPhysicallyInspectProperty ? 'new' : ''}" data-badge-caption="Yes"></span></div>
          <div class="col s6"><span class="left badge ${params.parameters.didYouPhysicallyInspectProperty ? '' : 'new red'}" data-badge-caption="No"></span></div>
        </div>
      </div>
      </div>
    </div><div class="html2pdf__page-break"></div>
    `;

    pages.push(page10);



    const page11 = `
    <div class="pdf-container row" style="${pageCSS}">
      <div class="pdf-box col s10 offset-s1">
      <div class="row pdf-border-bottom col s12 ${headerStyle == null ? 'e-value-green' : headerStyle}"
            style="margin-bottom: 0; padding-bottom: 0; ${headerStyle == null ? '' : headerStyle}">
        <h5 class="center white-text">EVALUATION REQUIREMENTS</h5>
      </div>
      <div class="row">
        <p class="pdf-paragraph">XII. Evaluation Development A valuation method that does not provide a property's market
        value or sufficient information and analysis to support the value conclusion is not acceptable as an evaluation.
        For example, a valuation method that provides a sales or list price, such as a broker price opinion, cannot be used
        as an evaluation because, among other things, it does not provide a property's market value. Further, the Dodd-Frank Act
        provides "[i]n conjunction with the purchase of a consumer's principal dwelling, broker price opinions may not be used as
        the primary basis to determine the value of a piece of property for the purpose of loan origination of a residential mortgage
        loan secured by such piece of property."29 Likewise, information on local housing conditions and trends, such as a competitive
        market analysis, does not contain sufficient information on a specific property that is needed, and therefore, would not be
        acceptable as an evaluation. The information obtained from such sources, while insufficient as an evaluation, may be useful to
        develop an evaluation or appraisal. An institution should establish policies and procedures for determining an appropriate
        collateral valuation method for a given transaction considering associated risks. These policies and procedures should address
        the process for selecting the appropriate valuation method for a transaction rather than using the method that renders the highest
        value, lowest cost, or fastest turnaround time. A valuation method should address the property's actual physical condition and
        characteristics as well as the economic and market conditions that affect the estimate of the collateral's market value.
        It would not be acceptable for an institution to base an evaluation on unsupported assumptions, such as a property is in "average"
        condition, the zoning will change, or the property is not affected by adverse market conditions. Therefore, an institution should
        establish criteria for determining the level and extent of research or inspection necessary to ascertain the property's actual
        physical condition, and the economic and market factors that should be considered in developing an evaluation. An institution should
        consider performing an inspection to ascertain the actual physical condition of the property and market factors that affect its market
        value. When an inspection is not performed, an institution should be able to demonstrate how these property and market factors were
        determined. XIII. Evaluation Content An evaluation should contain sufficient information detailing the analysis, assumptions, and
        conclusions to support the credit decision. An evaluation's content should be documented in the credit file or reproducible. The
        evaluation should, at a minimum: Identify the location of the property. Provide a description of the property and its current and
        projected use. Provide an estimate of the property's market value in its actual physical condition, use and zoning designation as of
        the effective date of the evaluation (that is, the date that the analysis was completed), with any limiting conditions. Describe
        the method(s) the institution used to confirm the property's actual physical condition and the extent to which an inspection was
        performed. Describe the analysis that was performed and the supporting information that was used in valuing the property.
        Describe the supplemental information that was considered when using an analytical method or technological tool. Indicate all
        source(s) of information used in the analysis, as applicable, to value the property, including: • External data sources (such as
          market sales databases and public tax and land records); • Property-specific data (such as previous sales data for the subject property,
            tax assessment data, and comparable sales information); • Evidence of a property inspection; • Photos of the property; •
            Description of the neighborhood; or • Local market conditions. Include information on the preparer when an evaluation is performed
            by a person, such as the name and contact information, and signature (electronic or other legally permissible signature) of the
            preparer.</p>
      </div>
      <div class="row">
      <p class="pdf-paragraph">
      <b>Definition of Market Value</b><br>

      In accordance with Federal Reserve System 12 CFR Part 225, Federal Deposit Insurance Corporation (12 CFR Part 323), The Office of the Comptroller of Currency (12 CFR Part 34), “Market Value” is defined as follows: <br><br>
       <u>Regulatory Definition</u>: “The most probable price which a property should bring in a competitive and open market under all conditions requisite to a fair sale, the buyer and seller, each acting prudently, knowledgeably, and assuming the price is not affected by undue stimulus. Implicit in this definition is the consummation of a sale as of a specified date and the passing of title from seller to buyer under conditions whereby:
      </p>
      <ul class="pdf-paragraph browser-default">    
      <li>Buyer and seller are typically motivated;</li>
      <li>Both parties are well-informed or well-advised and each is acting in what they consider their own best interests;</li>
      <li>A reasonable time is allowed for exposure in the open market;</li>
      <li>Payment is made in terms of cash in U. S. dollars or in terms of financial arrangements comparable thereto; and</li>
      <li>The price represents the normal consideration for the property sold unaffected by special, or creative financing, or sales concessions granted by anyone associated with the sale.”</li>
      </ul>
      </div>
      </div>
    </div><div class="html2pdf__page-break"></div>
    `;

    pages.push(page11);

    const {s3Images} = params;
    // Property Pictures
    if(s3Images.propertyPictures.length > 0){
      const {propertyPictures} = s3Images;
      let propertyPicturesFiltered = propertyPictures.filter((p) => p.fileURI != null) // Filter out deleted photos
      const picHeight = 54/propertyPicturesFiltered.length;
      const propertyPicturePage = `
      <div class="pdf-container row" style="${pageCSS}">
        <div class="pdf-box col s10 offset-s1">
          <div class="row pdf-border-bottom col s12 ${headerStyle == null ? 'e-value-green' : headerStyle}"
                style="margin-bottom: 0; padding-bottom: 0; ${headerStyle == null ? '' : headerStyle}">
            <h5 class="center white-text">Property Pictures</h5>
          </div>
          ${propertyPicturesFiltered.map((pic) => `<div class="row"><div class="center"><img src="${pic.fileURI}" style="max-height: ${picHeight}rem; max-width: auto; margin-bottom: 0; padding-bottom: 0;"/></div></div>`)}
        </div>
      </div><div class="html2pdf__page-break"></div>
      `;
      pages.push(propertyPicturePage);
    }


    // Additional Exhibits
    if(s3Images.additionalExhibits.length > 0){
      const {additionalExhibits} = s3Images;
      for(let i = 0; i < additionalExhibits.length; i++) {
        const pic = additionalExhibits[i];
        if(pic.fileURI != null){
          const page = `
          <div class="pdf-container row" style="${pageCSS}">
            <div class="pdf-box col s10 offset-s1">
              <div class="row pdf-border-bottom col s12 ${headerStyle == null ? 'e-value-green' : headerStyle}"
                    style="margin-bottom: 0; padding-bottom: 0; ${headerStyle == null ? '' : headerStyle}">
                <h5 class="center white-text">${pic.pageName}</h5>
              </div>
              <div class="row">
                <div class="center">
                  <img style="max-width: 42rem; height: auto; margin-bottom: 0; padding-bottom: 0;" src="${pic.fileURI}"/>
                </div>
              </div>
            </div>
          </div><div class="html2pdf__page-break"></div>
          `;
          pages.push(page);
        }
      }
    }


    const notesPage = `
    <div class="pdf-container row" style="${pageCSS}">
      <div class="pdf-box col s10 offset-s1">
        <div class="row pdf-border-bottom col s12 ${headerStyle == null ? 'e-value-green' : headerStyle}"
            style="margin-bottom: 0; padding-bottom: 0; ${headerStyle == null ? '' : headerStyle}">
          <h5 class="center white-text">Additional Comments</h5>
        </div>
        <div class="row pdf-border-bottom col s12 pdf-notes-section">
          <h6>Comment 1:</h6>
          <p id="comment-1" class="comment-rendering" style="max-height: 13rem; font-size: 13px">${params.parameters.taxOverheadNotes != null && params.parameters.taxOverheadNotes != '' ? params.parameters.taxOverheadNotes : ''}</p>
        </div>
        <div class="row pdf-border-bottom col s12 pdf-notes-section">
          <h6>Coment 2:</h6>
          <p id="comment-2" class="comment-rendering" style="max-height: 13rem; font-size: 13px;">${params.parameters.additionalExhibitsNotes != null && params.parameters.additionalExhibitsNotes != '' ? params.parameters.additionalExhibitsNotes : ''}</p>
        </div>
        <div class="row pdf-border-bottom col s12 pdf-notes-section">
          <h6>Comment 3:</h6>
          <p id="comment-3" class="comment-rendering" style="max-height: 13rem; font-size: 13px;">${params.parameters.soilsNotes != null && params.parameters.soilsNotes != '' ? params.parameters.soilsNotes : ''}</p>
        </div>
        <div class="row col s12 pdf-notes-section">
          <h6>Comment 4:</h6>
          <p id="comment-4" class="comment-rendering" style="max-height: 13rem; font-size: 13px;">${params.parameters.floodMapNotes != null && params.parameters.floodMapNotes != '' ? params.parameters.floodMapNotes : ''}</p>
        </div>
      </div>
      <script type="text/javascript">
            (function(){
                function isOverflown(element) {
                    return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
                }
                let list = [];
                for(let i = 1; i < 5; i++) {
                    list.push(document.getElementById('comment-'+i));
                }
                let fontSizes = [];
                for(let x = 0; x < list.length; x++){
                    let fontSize = parseFloat(list[x].style.fontSize)
                    for(let f = fontSize; f > 0; f -= 1.5){
                        let overflow = isOverflown(list[x]);
                        if(overflow){
                            fontSize -= 1.5;
                            list[x].style.fontSize = fontSize;
                        }
                    }
                    fontSizes.push(fontSize);
                }
            })();
           
      </script>
    </div><div class="html2pdf__page-break"></div>
    `;

    pages.push(notesPage);
    // Need Interagency Evaluation Requirements.

    // const pdf = `<div>${page1}${page2}${page3}${page4}${page5}${page6}${page7}${page8}${page9}${page10}${page11}${page12}</div>`;

    // html2pdf(pdf, {
    //   filename: 'test.pdf',
    //   margin: 1,
    //   html2canvas: {dpi: 96, letterRendering: true},
    //   image: { type: 'jpeg', quality: 0.98 },
    //   jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    //   pdfCallback: function (pdf) {
    //     const pdfBlob = pdf.output('blob');
    //     action({params, saveEval, existingEval, filename, pdfCreation: true, pdf: pdfBlob})
    // }});
    exportHTMLToPDF(pages, 'blob', incrementSaveProgress,  (pdf) => {
      DOMURL.revokeObjectURL(svgURL);
      action({params, saveEval, existingEval, filename, pdfCreation: true, pdf});
    });
};

export default generatePDF
