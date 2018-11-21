/**
 * Created by rayde on 1/2/2018.
 */
import React from 'react'
import SuperSelectField from 'material-ui-superselectfield'

const AreaCountySelect = ({onChange, areaCounties, counties}) => (
    <div style={{marginTop: '1rem'}}>
        <SuperSelectField onChange={onChange}
                          value={areaCounties}
                          name="Counties" hintText="Pick some counties"
                          multiple>
            {counties.map((county) => {
                return (
                    <option key={county.value} value={county.value}
                            label={county.label}>
                        {county.label}
                    </option>
                );
            })}
        </SuperSelectField>
    </div>
);

export default AreaCountySelect