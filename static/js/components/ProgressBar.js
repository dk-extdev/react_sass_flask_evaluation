import React from 'react'

const ProgressBar = ({loadPercentage}) => {
    return (
      <div className="progress">
        <div className="determinate" style={{width: `${loadPercentage}%`}} />
      </div>
    );
}

export default ProgressBar
