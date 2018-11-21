/**
 * Created by rayde on 1/8/2018.
 */
import React, {Component} from 'react'
import {numToCurrency, precisionRounding} from '../helpers'
import {VictoryChart, VictoryScatter, VictoryLine, VictoryAxis, VictoryLabel, VictoryTheme} from 'victory'
import moment from 'moment'

const JSDateToExcelDate = (inDate) => {
    const returnDateTime = 25569.0 + ((inDate.getTime() - (inDate.getTimezoneOffset() * 60 * 1000)) / (1000 * 60 * 60 * 24));
    return parseFloat(returnDateTime.toString().substr(0, 5));
};


const ExcelDateToJSDate = (serial) => {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);

    const fractional_day = serial - Math.floor(serial) + 0.0000001;

    let total_seconds = Math.floor(86400 * fractional_day);

    const seconds = total_seconds % 60;

    total_seconds -= seconds;

    const hours = Math.floor(total_seconds / (60 * 60));
    const minutes = Math.floor(total_seconds / 60) % 60;

    return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
};

const findTrendLineByLeastSquares = (data) => {
    /**
     * This function finds a best fit trend line by least squares then takes each data point and plugs it into the resulting function.
     * data should be formatted in (x, y) where x is a Date object of the Land Data sale date and y is the Sale Price per Unit (Acre)
     * **/
    const {sumX, sumY, sumX2, sumXY} = data.reduce((sum, coor) => {
        const {x, y} = coor;
        sum['sumX'] += x;
        sum['sumY'] += y;
        sum['sumX2'] += x * x;
        sum['sumXY'] += x * y;
        return sum;
    }, {sumX: 0, sumY: 0, sumX2: 0, sumXY: 0});

    // Calculate slope.
    const m = (((data.length * sumXY) - (sumX * sumY)) / ((data.length * sumX2) - (sumX * sumX)));
    // Calculate intercept.
    const b = (sumY - (m * sumX)) / (data.length);

    const yMean = sumY / data.length;

    const {ssTot, ssRes, ssReg, ssr} = data.reduce(({ssTot, ssRes,ssReg, ssr}, {y, x}) => {
        const yMeanDiff = y - yMean;
        const fi = (m * x) + b;
        return {
            ssTot: ssTot + ((yMeanDiff) * (yMeanDiff)), ssRes: ssRes + ((y - (fi)) * (y - (fi))),
            ssReg: ssReg + ((fi - y) * (fi - y)), ssr: ssr + ((fi - yMean) * (fi - yMean))
        }
    }, {ssTot: 0, ssRes: 0, ssReg: 0, ssr: 0});

    // coefficient of determination of linear regression
    const R2 = 1 - ssReg / ssTot;
    //const R2 = ssr / ssTot;

    return Object.assign({}, {
        trendData: data.map((coor) => {
            const {x} = coor;
            return {x, y: ((m * x) + b)};
        })
    }, {m: m.toFixed(5), b: parseFloat(b.toFixed(5)), R2: R2.toFixed(4)});
};

class ValuationSummary extends Component {
    constructor(props) {
        super(props);
        if(this.props.existing){
          this.state = {
            scatterData: this.props.savedScatterData === '' ? [] : this.props.savedScatterData,
            trendData: this.props.savedTrendData === '' ? [] : this.props.savedTrendData,
            m: this.props.m,
            b: this.props.b,
            R2: this.props.R2
          }
        }
        else {
          const scatterData = this.props.scatterData != null && this.props.scatterData != ''? this.props.scatterData.map((data) => {
              return {x: JSDateToExcelDate(new Date(data.saleDate)), y: data.salePriceNum / data.acres}
          }) : [];
          const {trendData, m, b, R2} = this.props.scatterData != null && this.props.scatterData != ''? findTrendLineByLeastSquares(scatterData) : {
              trendData: [],
              m: 0,
              b: 0,
              R2: 0
          };
          this.state = {
              scatterData: scatterData,
              trendData: trendData,
              m,
              b,
              R2
          };
        }
    }
    componentDidMount(){
        const {scatterData, trendData, m, b, R2} = this.state;
        if(scatterData.length > 0 || trendData.length > 0){
            const newMarketTrend = {
                scatterData,
                trendData,
                m,
                b,
                R2
            };
            let scatterDataString = newMarketTrend.scatterData.map((coor) => `(${coor.x},${coor.y})`).join(',');
            let trendDataString = newMarketTrend.trendData.map((coor) => `(${coor.x},${coor.y})`).join(',');
            this.props.updateMarketTrendGraph(Object.assign({}, newMarketTrend, {scatterData: scatterDataString, trendData: trendDataString}))
        }
    }

    componentDidUpdate(prevProps) {
        if(this.props.existing && (this.props.savedScatterData.length !== prevProps.savedScatterData.length || this.props.savedTrendData.length !== prevProps.savedTrendData.length)){
          this.setState({
              scatterData: this.props.savedScatterData,
              trendData: this.props.savedTrendData,
              m: this.props.m,
              b: this.props.b,
              R2: this.props.R2
          })
        }
        else if (this.props.scatterData !== null && this.props.scatterData.length != prevProps.scatterData.length) {
            const scatterData = this.props.scatterData != null ? this.props.scatterData.map((data) => {
                return {x: JSDateToExcelDate(new Date(data.saleDate)), y: data.salePriceNum / data.acres}
            }) : [];
            const {trendData, m, b ,R2} = this.props.scatterData != null ? findTrendLineByLeastSquares(scatterData) : {
                trendData: [],
                m: 0,
                b: 0,
                R2: 0
            };
            const newMarketTrend = {
                scatterData,
                trendData,
                m,
                b,
                R2
            };
            this.setState(newMarketTrend);
            let scatterDataString = newMarketTrend.scatterData.map((coor) => `(${coor.x},${coor.y})`).join(',');
            let trendDataString = newMarketTrend.trendData.map((coor) => `(${coor.x},${coor.y})`).join(',');
            this.props.updateMarketTrendGraph(Object.assign({}, newMarketTrend, {scatterData: scatterDataString, trendData: trendDataString}));
        }
    }

    componentDidMount() {
        $('.tooltipped').tooltip({delay: 50});
    }

    componentWillUnmount() {
        $('.tooltipped').tooltip('remove')
    }

    render() {
        const {valuation, propertyRating, existing, updated, improvements} = this.props;
        const totalImprovementsValue = improvements == null ? 0 : improvements.totalImprovementsValue;
        return (
            // // <div className="modal" id="deleteEvalModal" >
            // // <div className="modal-content">
            <div >
                <div className="row ">
                    <div className="col s6">
                        <h1 className="ag-heading">Valuation: </h1>
                    </div>
                    {/* <div className="col s6">
                        <div className="fixed-action-btn horizontal">
                            <a className="btn-floating btn-large red pulse">
                                <i className="large material-icons">menu</i>
                            </a>
                            <ul>
                                <li>
                                    <a className="btn-floating red tooltipped" data-position="top" data-delay="50"
                                       data-tooltip={existing ? 'Delete this evaluation' : 'Cancel this evaluation'} onClick={this.props.onClickDelete}>
                                        <i className="material-icons">delete</i>
                                    </a>
                                </li>
                                <li className={!existing ? 'hidden' : ''}>
                                  <a className="btn-floating blue tooltipped" data-position="top" data-delay="50"
                                     data-tooltip="Download existing PDF" disabled={existing && (updated || this.props.pdf == null)} href={this.props.pdf} download={this.props.title + '.pdf'}>
                                      <i className="material-icons">file_download</i>
                                  </a>
                                </li>
                                <li>
                                    <a className="btn-floating amber tooltipped" data-position="top" data-delay="50"
                                       data-tooltip="Save Evaluation"  disabled={existing && !updated} onClick={this.props.saveEvaluation}>
                                        <i className="material-icons">save</i>
                                    </a>
                                </li>
                                <li>
                                  <a className="btn-floating green tooltipped" data-position="top" data-delay="50"
                                  data-tooltip="Save & Download PDF" disabled={existing && !updated && this.props.pdf != null} onClick={this.props.onClickSubmit}><i className="material-icons">cloud_download</i></a>
                                </li>
                            </ul>
                        </div>
                    </div> */}
                </div>

                <div id="valuation-summary">
                    <div className="row valuation-field">
                        <div className="col s6">
                            <h3 className="rating-subheader">Property Rating:</h3>
                        </div>
                        <div className="col s6">
                            <h3 className="rating-subheader right">{propertyRating == null ? 'N/A' : propertyRating}</h3>
                        </div>
                    </div>
                    <div className="row valuation-field">
                        <div className="col s6">
                            <h3 className="rating-subheader">Low:</h3>
                        </div>
                        <div className="col s6">
                            <h3 className="rating-subheader right">{valuation.modMin == null ? 'N/A' : numToCurrency(precisionRounding(valuation.modMin, 0))}</h3>
                        </div>
                    </div>
                    <div className="row valuation-field">
                        <div className="col s6">
                            <h3 className="rating-subheader">Average:</h3>
                        </div>
                        <div className="col s6">
                            <h3 className="rating-subheader right">{valuation.average == null ? 'N/A' : numToCurrency(precisionRounding(valuation.average, 0))}</h3>
                        </div>
                    </div>
                    <div className="row valuation-field">
                        <div className="col s6">
                            <h3 className="rating-subheader">High:</h3>
                        </div>
                        <div className="col s6">
                            <h3 className="rating-subheader right">{valuation.modMax == null ? 'N/A' : numToCurrency(precisionRounding(valuation.modMax, 0))}</h3>
                        </div>
                    </div>
                    <div className="row valuation-field">
                        <div className="col s6">
                            <h3 className="rating-subheader">Standard Deviation:</h3>
                        </div>
                        <div className="col s6">
                            <h3 className="rating-subheader right">{valuation.stndDeviation == null ? 'N/A' : numToCurrency(precisionRounding(valuation.stndDeviation, 0))}</h3>
                        </div>
                    </div>
                    <div className="row valuation-field">
                        <div className="col s6">
                            <h3 className="rating-subheader">Coefficient of Variation:</h3>
                        </div>
                        <div className="col s6">
                            <h3 className="rating-subheader right">{valuation.stndDeviation == null || valuation.average == null || valuation.average == 0 ? 'N/A' :
                            precisionRounding((valuation.stndDeviation/valuation.average)*100, 2)}%</h3>
                        </div>
                    </div>
                    <div className="row valuation-field">
                        <div className="col s6">
                            <h3 className="rating-subheader">Reconciled per unit:</h3>
                        </div>
                        <div className="col s6">
                            <h3 className="rating-subheader right">
                                <b>{valuation.valueUnitConcluded == null || this.props.acres == null ? 'N/A' : numToCurrency(precisionRounding(valuation.reconciledPerUnit, 0))}</b>
                            </h3>
                        </div>
                    </div>
                    <div className="row valuation-field">
                        <div className="col s6">
                            <h3 className="rating-subheader">Value/Unit Concluded:</h3>
                        </div>
                        <div className="col s6">
                            <h3 className="rating-subheader right">
                                <b>{valuation.valueUnitConcluded == null || this.props.acres == null ? 'N/A' : valuation.valueUnitConcluded >= 1000 ?
                                 numToCurrency(precisionRounding(valuation.valueUnitConcluded, -3)) : numToCurrency(precisionRounding(valuation.valueUnitConcluded, 0))}</b>
                            </h3>
                        </div>
                    </div>
                    <div className="row valuation-field">
                        <div className="col s6">
                            <h3 className="rating-subheader">Total Improvements Value:</h3>
                        </div>
                        <div  className="col s6">
                            <h3 className="rating-subheader right">{this.props.improvements == null ? '$0' : totalImprovementsValue >= 1000 ?
                            numToCurrency(precisionRounding(totalImprovementsValue, -3)) : numToCurrency(precisionRounding(totalImprovementsValue, 0))}</h3>
                        </div>
                    </div>
                    <div className="row valuation-field">
                        <div className="col s6">
                            <h3 className="rating-subheader">Total Value/Unit Concluded:</h3>
                        </div>
                        <div className="col s6">
                            <h3 className="rating-subheader right"><b>{valuation.valueUnitConcluded == null || this.props.acres == null? 'N/A' : (valuation.valueUnitConcluded + totalImprovementsValue) >= 1000 ?
                             numToCurrency(precisionRounding(valuation.valueUnitConcluded + totalImprovementsValue, -3)) : numToCurrency(precisionRounding(valuation.valueUnitConcluded + totalImprovementsValue, 0))}</b></h3>
                        </div>
                    </div>
                </div>
                <div className="row valuation-field" id="market-trend-graph">
                    <h3 className="rating-subheader" style={{marginBottom: 0}}>Market Trends</h3>
                    {this.state.scatterData.length === 0 ? null :
                        <VictoryChart domainPadding={{x: [20, 20], y: [valuation.min, 20]}}
                                      theme={VictoryTheme.material}>
                            <VictoryScatter data={this.state.scatterData}
                                            style={{ data: { fill: "#AA8930", opacity: 0.7 } }}/>
                            <VictoryLine data={this.state.trendData}
                                         style={{data: {stroke: '#384624', strokeDasharray: [10, 5], strokeWidth: 3}}}/>
                            <VictoryAxis style={{tickLabels: {fontSize: 10}}} dependentAxis
                                         tickFormat={(tick) => `$${tick}`}/>
                            <VictoryAxis style={{tickLabels: {fontSize: 6}}} tickCount={5}
                                         tickFormat={(tick) => moment(ExcelDateToJSDate(tick)).format('MM/DD/YYYY')}/>
                            <VictoryLabel text={`y=${this.state.m}x + ${this.state.b}`} y={12} x={25}/>
                            <VictoryLabel text={`R2=${this.state.R2}`} y={30} x={25}/>
                        </VictoryChart>
                     }
                </div>
            </div>


        );
    }
}

export default ValuationSummary
