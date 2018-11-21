import React, {Component} from 'react'
import {connect} from 'react-redux'
import {fetchEvaluationSaveLog} from '../ducks/evaluation'
import * as actionTypes from '../ducks/constants'
import Spinner from '../components/Spinner'
import moment from 'moment'

const mapStateToProps = (state, ownProps) => {
    return {
        isFetchingSaveLog: state.evaluation.isFetchingSaveLog,
        evaluationSaveLog: state.evaluation.evaluationSaveLog,
        orgId: ownProps.params.orgId
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getEvaluationSaveLog: (orgId) => {
            dispatch(fetchEvaluationSaveLog(actionTypes.FETCH, {orgId}));
        }
    };
};

class EvaluationSaveLogContainer extends Component {
    constructor(props){
        super(props);
        this.renderSaveLog = this.renderSaveLog.bind(this);
    }
    componentDidMount(){
        const {orgId, getEvaluationSaveLog} = this.props;
        getEvaluationSaveLog(orgId);
    }
    componentDidUpdate(prevProps){
        if(prevProps.isFetchingSaveLog === true && this.props.isFetchingSaveLog === false){
            $('.collapsible').collapsible();
        }
    }
    renderSaveLog(){
        const {isFetchingSaveLog, evaluationSaveLog} = this.props;

        if(isFetchingSaveLog){
            return (
              <div className="row ">
                  <div className="center">
                      <Spinner />
                  </div>
              </div>
            );
        }
        const filteredEvalSaveLog = evaluationSaveLog == null ? [] : evaluationSaveLog.filter((log) => log.has_pdf);
        if (evaluationSaveLog == null || filteredEvalSaveLog.length === 0) {
            return (
                <div className="row col s12">
                    <h2 className="center grey-text text-lighten-2">No Evaluation Saves</h2>
                </div>
            );
        }

        return (
          <ul className="collapsible" data-collapsible="accordion">
              {filteredEvalSaveLog.map((log) => {
                  const {evaluation} = log;
                  const evalName = evaluation.name == null ? evaluation.mapParcelNumber + ' ' + evaluation.propertyAddress.address1
                  : evaluation.mapParcelNumber + ' ' + evaluation.name;
                  return (
                      <li key={log.id}>
                          <div className="collapsible-header">
                              <i className={"left material-icons " + (log.exempted ? 'amber-text' : 'green-text')}>{log.exempted ? 'verified_user' : 'payment'}</i>
                              {evalName}
                          </div>
                          <div className="collapsible-body">
                              <div className="row col s12 container">
                                  <div className="row">
                                      <div className="col s6">
                                          <p className="center">Save Date:</p>
                                      </div>
                                      <div className="col s6">
                                          <p className="center">{moment(log.timestamp).format('hh:mm a, ddd MMM Do, YYYY')}</p>
                                      </div>
                                  </div>
                                  <div className="row">
                                      <div className="col s6">
                                          <p className="center">Save Reason: </p>
                                      </div>
                                      <div className="col s6">
                                          <p className="center">{log.saveCriteria}</p>
                                      </div>
                                  </div>
                                  <div className="row">
                                      <div className="col s6">
                                          <p className="center">Exempted</p>
                                      </div>
                                      <div className="col s6">
                                          <p className="center"><i className={"material-icons " + (log.exempted ? 'green-text' : 'amber-text')}>payment</i></p>
                                      </div>
                                  </div>
                                  <div className="row">
                                      <button disabled={true} className={"col s4 offset-s2 btn " + (log.exempted ? 'red' : 'green')}>{log.exempted ? 'Unexempt Save' : 'Exempt Save'}</button>
                                      <button disabled={true} className="col s4 btn e-value-yellow">Go To Eval</button>
                                  </div>
                              </div>
                          </div>
                      </li>
                  );
              })}
          </ul>
        );
    }
    render(){
        return (
            <div>
                <div className="row">
                    <h1 className="text-padding">Evaluation Save Log</h1>
                </div>
                <div className="row"><div className="divider"></div></div>
                <div className="row">
                  {this.renderSaveLog()}
                </div>
            </div>
        );
    }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EvaluationSaveLogContainer)
