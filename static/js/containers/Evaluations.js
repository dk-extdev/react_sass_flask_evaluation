/**
 * Created by rayde on 12/21/2017.
 */
/**
 * Created by rayde on 12/21/2017.
 */
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {push} from 'react-router-redux'
import {fetchEvaluations} from '../ducks/evaluation'
import * as actionTypes from '../ducks/constants'
import moment from 'moment'
import Spinner from '../components/Spinner'
import {numToCurrency, precisionRounding} from '../helpers'
import EvaluationsList from '../components/EvaluationsList'
import {deleteEvaluation} from '../ducks/evaluation'
import Settings from '../containers/Settings'


const mapStateToProps = (state) => {
    return {
        isFetchingEvaluations: state.evaluation.isFetching,
        hasFetchedEvaluations: state.evaluation.hasFetched,
        evaluations: state.evaluation.evaluations,
        organization: state.user.organization,
        isDeleteEvaluations: state.evaluation.isDeleting
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        goToNewEval: () => {
            dispatch(push('/evaluations/new'))
        },
        getEvals: (orgId) => {
            dispatch(fetchEvaluations(actionTypes.FETCH, {orgId}));
        },
        goToEval: (evalId) => {
            dispatch(push(`/evaluations/${evalId}`))
        },
        deleteEval: (evalId) => {
            dispatch(deleteEvaluation(actionTypes.FETCH, {evalId}));
        },
        saveEvalAndPDF: (params) => {
            dispatch(downloadPDF(actionTypes.FETCH, {
                params,
                saveEval: false,
                existingEval: true,
                filename: params.pdfFilename
            }))
        }
    }
};

class Evaluations extends Component {
    constructor(props){
        super(props);
        this.renderSpinner = this.renderSpinner.bind(this);
    }
    componentDidMount() {
        $('.tooltipped').tooltip({delay: 50});
        $('#settingModal').modal();
        const {isFetchingEvaluations, hasFetchedEvaluations, getEvals, organization} = this.props;
        if (!isFetchingEvaluations && !hasFetchedEvaluations) {
            getEvals(organization.id);
        }
    }
    
    componentDidUpdate(prevProps){
      const {isFetchingEvaluations, hasFetchedEvaluations, getEvals, organization} = this.props;
      if(!isFetchingEvaluations && hasFetchedEvaluations == false){
        getEvals(organization.id);
      }
    }

    componentWillUnmount() {
        $('.tooltipped').tooltip('remove');
        $('#settingModal').modal('close');
    }
    renderSpinner() {
        const {
            isDeleteEvaluations
            } = this.props;
        if (isDeleteEvaluations) {
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

    render() {
        return (
            <div>
                {this.renderSpinner()}
                {/* <div className="fixed-action-btn">
                    <button className="btn-floating btn-large e-value-yellow tooltipped pulse" data-position="left"
                            data-delay="50"
                            data-tooltip="Create a new Evaluation" onClick={this.props.goToNewEval}>
                        <i className="large material-icons">add</i>
                    </button>
                </div> */}
                {/* <div className="row">
                    <h1 className="e-value-text-green">Evaluations</h1>
                </div> */}
                <div className="divider">
                </div>
                <div className="modal scroll-modal" id="settingModal">
                <Settings/>
                </div> 
                <EvaluationsList isFetchingEvaluations={this.props.isFetchingEvaluations} evaluations={this.props.evaluations} goToEval={this.props.goToEval} deleteEval={this.props.deleteEval} saveEvalAndPDF={this.props.saveEvalAndPDF}/>
            </div>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Evaluations)
