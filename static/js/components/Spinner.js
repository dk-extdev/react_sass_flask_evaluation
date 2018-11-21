/**
 * Created by rayde on 11/14/2017.
 */
import React from 'react'

const Spinner = (size='big') => (
    <div className={`preloader-wrapper ${size} active`}>
        <div className="spinner-layer">
            <div className="circle-clipper left">
                <div className="circle"></div>
            </div>
            <div className="gap-patch">
                <div className="circle"></div>
            </div>
            <div className="circle-clipper right">
                <div className="circle"></div>
            </div>
        </div>
    </div>
);

export default Spinner