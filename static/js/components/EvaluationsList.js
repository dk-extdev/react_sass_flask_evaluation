import React, {Component} from 'react'
import moment from 'moment'
import {numToCurrency, precisionRounding} from '../helpers'
import Spinner from './Spinner'

class EvaluationsList extends Component {
  constructor(props){
    super(props);
    this.renderOrganizationCards = this.renderOrganizationCards.bind(this);
    this.state = {
      timeout: null,
      openTimeout: null
    }
    $('#evaluation').text('Create New');
    this.onClickDelete = this.onClickDelete.bind(this);
  }

  componentDidMount(){
    const {isOrgContainer} = this.props;
    const {timeout, openTimeout} = this.state;
    const evalListCtx = this;
    $('#deleteEvalModal').modal();
    $('.collapsible').collapsible({onOpen: function(el){

        if(isOrgContainer){
          // This is to fix a bug that I assume exists with using jquery (materialize) and react together.
          // When I render the Evaluations List inside a tab (Organization Container), the .collapsible-body never
          //    changes the to the height of the content inside the collapsible body. So, I set a timeout for half a second to
          //    make sure I beat Materialize in changing the style of the .collapsible-body. I then set the height of the
          //    .collapsible-body to the height of the content of the body + margin of the content + the top and bottom padding of the .collapsible-body.
          //    This then pushes all other .collapsible-headers down and renders the box around the content properly
          const collapsibleBody = el.find('.collapsible-body');
          // need to calculate the height
          const content = collapsibleBody.find('.collapsible-content');
          const padding = parseFloat(collapsibleBody.css('padding-top').replace('px')) + parseFloat(collapsibleBody.css('padding-bottom').replace('px'))
          const height = (parseFloat(content.css('height').replace('px')) + parseFloat(content.css('margin-bottom').replace('px')) + padding) + 'px';

          if(timeout != null){
            clearTimeout(timeout);
          }
          if(openTimeout != null){
            clearTimeout(openTimeout);
            evalListCtx.setState({
              openTimeout: null
            });
          }
          setTimeout(function(){
            collapsibleBody.css('height', height);
            evalListCtx.setState({
              timeout: null
            });
          }, 300);

        }
      }, onClose: function (el) {
        if(isOrgContainer){
          const collapsibleBody = el.find('.collapsible-body');
          collapsibleBody.css('height', '');
          if(timeout != null){
            clearTimeout(timeout);
            evalListCtx.setState({
              timeout: null
            })
          }
        }
      }
    });
    if(isOrgContainer){
      const openT = setTimeout(function(){
        $('.collapsible').collapsible('open', 0)
        clearTimeout(openTimeout);
      }, 500);
      evalListCtx.setState({
        openTimeout: openT
      })
    }
  }

  componentWillUnmount(){
    $('#deleteEvalModal').modal('close');
  }

  componentDidUpdate(prevProps){
    if(prevProps.evaluations.length !== this.props.evaluations.length){
      const {isOrgContainer} = this.props;
      const {timeout, openTimeout} = this.state;
      const evalListCtx = this;
      $('.collapsible').collapsible({onOpen: function(el){
        if(isOrgContainer){
          // This is to fix a bug that I assume exists with using jquery (materialize) and react together.
          // When I render the Evaluations List inside a tab (Organization Container), the .collapsible-body never
          //    changes the to the height of the content inside the collapsible body. So, I set a timeout for 3/10 second to
          //    make sure I beat Materialize in changing the style of the .collapsible-body. I then set the height of the
          //    .collapsible-body to the height of the content of the body + margin of the content + the top and bottom padding of the .collapsible-body.
          //    This then pushes all other .collapsible-headers down and renders the box around the content properly
          const collapsibleBody = el.find('.collapsible-body');
          // need to calculate the height
          const content = collapsibleBody.find('.collapsible-content');

          const padding = parseFloat(collapsibleBody.css('padding-top').replace('px')) + parseFloat(collapsibleBody.css('padding-bottom').replace('px'))
          const height = (parseFloat(content.css('height').replace('px')) + parseFloat(content.css('margin-bottom').replace('px')) + padding) + 'px';


          if(timeout != null){
            clearTimeout(timeout);
          }
          if(openTimeout != null){
            clearTimeout(openTimeout);
            evalListCtx.setState({
              openTimeout: null
            });
          }
          setTimeout(function(){
            collapsibleBody.css('height', height);

            evalListCtx.setState({
              timeout: null
            });
          }, 300);
        }
      }, onClose: function (el) {
        if(isOrgContainer){
          const collapsibleBody = el.find('.collapsible-body');
          collapsibleBody.css('height', '');
          if(timeout != null){
            clearTimeout(timeout);
            evalListCtx.setState({
              timeout: null
            })
          }
        }
      }
    });
      if(isOrgContainer){
        if(openTimeout != null){
          clearTimeout(openTimeout);
        }
        const openT = setTimeout(function(){
          $('.collapsible').collapsible('open', 0)
          clearTimeout(openTimeout);
        }, 500);
        evalListCtx.setState({
          openTimeout: openT
        })
      }
    }
  }
  downloadPdfFile(uri, name){
    return () => {
      let link = document.createElement("a");
      link.download = name;
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  onClickDelete(){
    $('#deleteEvalModal').modal('open');
  }

  renderOrganizationCards(){
    const {isFetchingEvaluations, evaluations, goToEval,deleteEval ,saveEvalAndPDF} = this.props;
      const numRows = Math.ceil(evaluations.length / 3);
      let rows = [];
      for(let r = 0; r < numRows; r++){
          let row = [];
          const rowIndexStart = r * 3;
          const rowIndexEnd = (rowIndexStart + 3) >= evaluations.length ? evaluations.length : rowIndexStart + 3;
          for(let i = rowIndexStart; i < rowIndexEnd; i++){
              const evaluation = evaluations[i];
              const totalImprovementsValue = evaluation.improvements == null ? 0 : evaluation.improvements.totalImprovementsValue;
              const totalValueUnitConcluded = evaluation.valueUnitConcluded + totalImprovementsValue;
              const title = evaluation.mapParcelNumber + ' ' + (evaluation.name == null || evaluation.name == '' ? evaluation.propertyAddress.address1 : evaluation.name);
              row.push(
                  <div className="col l4 m6 s12" key={evaluation.id}>
                                <div className="div-block-12">
                                  <div >
                                    <div >
                                    <div className="col s10">
                                    <h2 className="ag-heading">#{title}</h2>  
                                        </div>
                                        <div className="col s2 label-right">
                                        <a onClick={() => deleteEval(evaluation.id)} className="dash-card-close w-inline-block w-clearfix" id="btnClose" style={{fontSize:30,color:'black'}}>X</a>
                                        </div>

                                      <div className="row">
                                        <div className="col s6">
                                        <p>Total Value Unit Concluded: </p>
                                        </div>
                                        <div className="col s6 label-right">
                                        {totalValueUnitConcluded > 1000 ? numToCurrency(precisionRounding(totalValueUnitConcluded, -2)) :
                                          numToCurrency(precisionRounding(totalValueUnitConcluded, 0))}
                                        </div>
                                      </div>
                                      <div className="row">
                                        <div className="col s6">
                                          <p>Reconciled Per Unit:</p>
                                        </div>
                                        <div className="col s6 label-right">
                                          {numToCurrency(precisionRounding(evaluation.reconciledPerUnit, 0))}
                                        </div>
                                      </div>
                                      <div className="row">
                                        <div className="col s6">
                                          <p>Last Modified:</p>
                                        </div>
                                        <div className="col s6 label-right">
                                          {moment(evaluation.updatedAt).format('YYYY-MM-DD')}
                                        </div>
                                      </div>
                                      <div className="row">
                                        <div className="col s6" >
                                        <a className="submit-button card w-button" id="btnDownload" href={evaluation.pdf} download={title + '.pdf'}>Download</a>
                                        {/* <a className="submit-button card w-button" onClick={() => saveEvalAndPDF(evaluation.id)} id="btnDownload" href={evaluation.pdf} download={title + '.pdf'}>Download</a> */}
                                        </div>
                                        <div className="col s6" >
                                        <a className="submit-button card right w-button" id="btnEdit" onClick={() => goToEval(evaluation.id)}>Edit</a>
                                          {/* <button className="btn waves-effect waves-light" onClick={() => goToEval(evaluation.id)}>Go to Eval<i className="material-icons right">send</i></button> */}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>  
                               </div> 

              );
          }
          rows.push(
              <div className="row" key={r}>
                  {row}
              </div>
          );
      }
      return rows;
  }
  render(){
    const {isFetchingEvaluations, evaluations, goToEval} = this.props;
    if(isFetchingEvaluations){
        return (
            <div className="row ">
                <div className="center">
                    <Spinner />
                </div>
            </div>
        );
    }
    if (evaluations == null || evaluations.length === 0) {
        const style= {
          paddingTop: '10vh'
        }
        return (
            <div className="row col s12">
                <h2 className="center grey-text text-lighten-2" style={style}>No Evaluations</h2>
            </div>
        );
    }
    return (
      <div class="div-block-10">
        {this.renderOrganizationCards()}
      </div>

        // <div className="row card-container">
        //     {evaluations.map((evaluation, index) => {
        //       const totalImprovementsValue = evaluation.improvements == null ? 0 : evaluation.improvements.totalImprovementsValue;
        //       const totalValueUnitConcluded = evaluation.valueUnitConcluded + totalImprovementsValue;
        //       const title = evaluation.mapParcelNumber + ' ' + (evaluation.name == null || evaluation.name == '' ? evaluation.propertyAddress.address1 : evaluation.name);
        //       <div className="row">
        //       return (
        //         <div className="col 13 m6 s12">
        //         {/* <li key={evaluation.id} style={{height: '100%'}}> */}
        //           <div className={"valign-wrapper collapsible-header " + (index === 0 ? 'active' : '')}><i className="valign material-icons large e-value-text-yellow">archive</i>
        //             <h5 className="title">#{title}</h5>
        //           </div>
        //           <div className="collapsible-body col s12">
        //             <div className="row col s12 container collapsible-content">
        //               <div className="row">
        //                 <div className="col s6">
        //                 <p>Total Value Unit Concluded: </p>
        //                 </div>
        //                 <div className="col s6">
        //                 {totalValueUnitConcluded > 1000 ? numToCurrency(precisionRounding(totalValueUnitConcluded, -2)) :
        //                   numToCurrency(precisionRounding(totalValueUnitConcluded, 0))}
        //                 </div>
        //               </div>
        //               <div className="row">
        //                 <div className="col s6">
        //                   <p>Reconciled Per Unit:</p>
        //                 </div>
        //                 <div className="col s6">
        //                   {numToCurrency(precisionRounding(evaluation.reconciledPerUnit, 0))}
        //                 </div>
        //               </div>
        //               <div className="row">
        //                 <div className="col s6">
        //                   <p>Last Modified:</p>
        //                 </div>
        //                 <div className="col s6">
        //                   {moment(evaluation.updatedAt).format('YYYY-MM-DD')}
        //                 </div>
        //               </div>
        //               <div className="row">
        //                 <div className="col s6">
        //                   <a className="btn amber waves-effect waves-light" disabled={evaluation.pdf == null} href={evaluation.pdf} download={title + '.pdf'}>Download PDF</a>
        //                 </div>
        //                 <div className="col s6">
        //                   <button className="btn waves-effect waves-light" onClick={() => goToEval(evaluation.id)}>Go to Eval<i className="material-icons right">send</i></button>
        //                 </div>
        //               </div>
        //             </div>
        //           </div>
        //         {/* </li> */}
        //         </div>
        //       );
        //       </div>
        //     })}
        // </div>
    );
  }
}
export default EvaluationsList
