/**
 * Created by geoff on 1/26/2018.
 */
import React from 'react'

const PDFTestView = () => (
    <div className="pdf-container row">
        <div className="col s10 offset-s1 pdf-box">
            <div className="row pdf-border-bottom e-value-green col s12" style={{height: '5rem'}}>
            </div>
            <div className="row">
                <h4 className="center">Evaluation Report</h4>
            </div>
            <br/>
            <div className="row">
                <p className="center"><b>Prepared for:</b></p>
            </div>
            <div className="row">
                <p className="center">Iroquois Valley Farms LLC</p>
            </div>
            <div className="row">
                <p className="center">708 Church St. #227</p>
            </div>
            <div className="row">
                <p className="center">Evanston IL, 60201</p>
            </div>
        </div>
    </div>
);

export default PDFTestView