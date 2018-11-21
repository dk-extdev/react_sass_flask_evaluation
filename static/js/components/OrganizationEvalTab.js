import React from 'react'
import EvaluationsList from './EvaluationsList'

const OrganizationEvalTab = ({isFetchingEvaluations, evaluations, orgId, goToEval}) => {
    return (
      <div id="evaluations" className="col s12" style={{height: '100%'}}>
          <div className="row" style={{height: '100%'}}>
            <EvaluationsList isOrgContainer={true} isFetchingEvaluations={isFetchingEvaluations} evaluations={evaluations} goToEval={(evalId) => goToEval(evalId, orgId)}/>
          </div>
      </div>
    );
}

export default OrganizationEvalTab
