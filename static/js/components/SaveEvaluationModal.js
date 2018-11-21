/**
 * Created by geoff on 2/9/2018.
 */
import React, {Component} from 'react'

class SaveEvaluationModal extends Component {
    componentDidMount() {
        $('#saveEvalModal').modal();
    }

    componentWillUnmount(){
      $('#saveEvalModal').modal('close');
    }

    
    render() {
        return (
            <div className="modal" id="saveEvalModal">
                <div className="modal-content">
                    <h4>Save Evaluation</h4>
                    <p>*If your browser is zoomed in/out, please set it to 100% to ensure pdf is formated correctly.</p>
                    <div className="input-field">
                        <input type="text" id="filename" value={this.props.filename} onChange={this.props.onChangeFilename} placeholder="2017-05-22MerrillEval"/>
                        <label htmlFor="filename" className="active">PDF Name</label>
                    </div>
                </div>
                <div className="modal-footer">
                    <a onClick={this.props.submit} className="btn-flat">Save & Download PDF</a>
                    <a className="modal-close modal-action btn-flat">Cancel</a>
                </div>
            </div>
        );
    }
}

export default SaveEvaluationModal
