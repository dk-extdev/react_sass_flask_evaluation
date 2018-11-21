import React, {Component} from 'react'
import Spinner from './Spinner'
import moment from 'moment'

class StatsTab extends Component {
    componentDidMount(){
        $('.tooltipped').tooltip({delay: 50});
    }
    componentDidUpdate(){
        if(this.props.isFetchingSaveLog === false && this.props.isFetchingEvaluations === false) {
            $('.tooltipped').tooltip({delay: 50});
        }
    }
    componentWillUnmount(){
        $('.tooltipped').tooltip('remove');
    }
    render(){
        const {isFetchingEvaluations, evaluations, isFetchingSaveLog, evaluationSaveLog} = this.props;
        if(isFetchingEvaluations || isFetchingSaveLog){
            return (
                <div id="stats" className="col s12">
                  <div className="overlay-spinner">
                      <div className="row">
                          <div className="center">
                              <Spinner />
                          </div>
                      </div>
                  </div>
                </div>
            );
        }
        const totalEvals = evaluations.length; 
        // Need to filter these and take exempted/not has_pdf
        const totalEvalSavesDict = evaluationSaveLog.filter((log) => log.has_pdf && !log.exempted).reduce((dict, save) => {
            if(save.evaluation.id == null && save.evalId == null){
                if(dict['null'] == null){
                    dict['null'] = 1;
                }
                else{
                    dict['null'] += 1;
                }
            }
            else if(save.evaluation.id == null && save.evalId != null){
                if(dict[save.evalId] == null){
                    dict[save.evalId] = 1;
                }
                else {
                    dict[save.evalId] += 1;
                }
            }
            else {
                if(dict[save.evaluation.id] == null){
                    dict[save.evaluation.id] = 1;
                }
                else {
                  dict[save.evaluation.id] += 1;
                }
            }
            
            return dict;
        }, {});
        const totalEvalSaves = Object.keys(totalEvalSavesDict).reduce((count, evalId) => {
            return count + totalEvalSavesDict[evalId];
        }, 0);
        const orderedEvaluationSaves = evaluationSaveLog.filter((log) => log.has_pdf && !log.exempted).sort((evalsave1, evalsave2) => {
          const date1 = moment(evalsave1.timestamp);
          const date2 = moment(evalsave2.timestamp);
          if(date1 < date2){
            return -1
          }
          if(date1 > date2){
            return 1;
          }

          return 0;
        });

        const lastUpdated = totalEvalSaves > 0 ? orderedEvaluationSaves[orderedEvaluationSaves.length - 1].timestamp : 'N/A';
        const evalsThisMonth = totalEvalSaves > 0 ?
        orderedEvaluationSaves.filter((e) => moment().date(1).isSameOrBefore(e.timestamp, 'day')).length : 'N/A';
        const evalsLastMonth = totalEvalSaves > 0 ?
        orderedEvaluationSaves.filter((e) => moment().subtract(1, 'months').date(1).isSameOrBefore(e.timestamp, 'day') &&
        moment().date(1).isAfter(e.timestamp, 'day')).length : 'N/A';
        const evalsThisWeek = totalEvalSaves > 0 ?
        orderedEvaluationSaves.filter((e) => moment().day('Monday').isSameOrBefore(e.timestamp, 'day')).length : 'N/A';
        const evalsToday = totalEvalSaves > 0 ?
        orderedEvaluationSaves.filter((e) => moment().isSameOrBefore(e.timestamp, 'day')).length : 'N/A';
        return (
          <div id="stats" className="col s12">
              <div className="row container">
                  <div className="row">
                      <div className="col s6">
                          <p className="center">Total Evaluations: </p>
                      </div>
                      <div className="col s6">
                          <p className="center ">{totalEvals}
                          <i className="material-icons tooltipped blue-text pointer" data-delay="50"
                            data-position="bottom" data-tooltip="This number represents Total Evaluations including those that haven't meet criteria to be charged.">
                            info_outline
                        </i></p>
                      </div>
                  </div>
                  <div className="row">
                      <div className="col s6">
                          <p className="center">
                            Total Saved Evaluations: </p>
                      </div>
                      <div className="col s6 ">
                          <p className="center ">{totalEvalSaves}
                          <i className="material-icons tooltipped blue-text pointer" data-delay="50"
                            data-position="bottom" data-tooltip="This number represents Total Evaluation Saves that meet criteria to be charged. (Includes deleted Evals.)">
                            info_outline
                        </i></p>
                      </div>
                  </div>
                  <div className="row">
                      <div className="col s6">
                          <p className="center">Last Evaluation: </p>
                      </div>
                      <div className="col s6">
                          <p className="center">{lastUpdated == 'N/A' ? lastUpdated : moment(lastUpdated).format('MM/DD/YYYY')}</p>
                      </div>
                  </div>
                  <div className="row">
                      <div className="col s6">
                          <p className="center">Evaluations This Month: </p>
                      </div>
                      <div className="col s6">
                          <p className="center">{evalsThisMonth}</p>
                      </div>
                  </div>
                  <div className="row">
                      <div className="col s6">
                          <p className="center">Evaluations Last Month: </p>
                      </div>
                      <div className="col s6">
                          <p className="center">{evalsLastMonth}</p>
                      </div>
                  </div>
                  <div className="row">
                      <div className="col s6">
                          <p className="center">Evaluations This Week: </p>
                      </div>
                      <div className="col s6">
                          <p className="center">{evalsThisWeek}</p>
                      </div>
                  </div>
                  <div className="row">
                      <div className="col s6">
                          <p className="center">Evaluations Today: </p>
                      </div>
                      <div className="col s6">
                          <p className="center">{evalsToday}</p>
                      </div>
                  </div>
                  <div className="row">
                      <button disabled={true} onClick={() => this.props.goToSaveLog(this.props.orgId)}
                      className="e-value-yellow btn col s8 offset-s2">Go to Save Log <i className="material-icons right">send</i></button>
                  </div>
              </div>
          </div>
        );
    }
}

export default StatsTab
