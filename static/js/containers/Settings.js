import React, {Component} from 'react'
import {connect} from 'react-redux'
import Spinner from '../components/Spinner'
import * as actionTypes from '../ducks/constants'
import {requestPasswordReset} from '../ducks/user'
import {updateOwnOrg} from '../ducks/organization'
import {SketchPicker} from 'react-color'
import Color from 'color'

const mapStateToProps = (state) => {
  return {
      organization: state.user.organization,
      name: state.user.name,
      email: state.user.email,
      isRequestingNewPassword: state.user.isRequestingNewPassword,
      roles: state.user.roles,
      isUpdatingOrg: state.user.isUpdatingOwnOrg,
      isFetching: state.user.isFetching
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
      requestPasswordReset: (email) => {
          dispatch(requestPasswordReset(actionTypes.FETCH, {email}));
      },
      saveOrg: (payload) => {
          dispatch(updateOwnOrg(actionTypes.UPDATE, payload));
      }
  };
};

class Settings extends Component {
  constructor(props){
      super(props);
      const {organization} = this.props;
      let color = {
          r: 56,
          g: 70,
          b: 36,
          a: 1,
          updated: false
      };
      let logo = {
          file: null,
          fileURI: null,
          isProcessing: false,
          updated: false
      };
      if(organization != null){
          if(organization.primaryColor != null){
            color = Object.assign({}, organization.primaryColor, {updated: false});
          }
          if(organization.logo != null) {
            logo = Object.assign({}, organization.logo, {updated: false});
          }
      }
      this.state = {
          displayColorPicker: false,
          color,
          logo,
          updated: false
      }
      this.handleClickColor = this.handleClickColor.bind(this);
      this.handleColorClose = this.handleColorClose.bind(this);
      this.handleColorChange = this.handleColorChange.bind(this);
      this.clearImage = this.clearImage.bind(this);
      this.onImageChange = this.onImageChange.bind(this);
      this.onResetClick = this.onResetClick.bind(this);
      this.onSaveClick = this.onSaveClick.bind(this);
      this.renderSpinner = this.renderSpinner.bind(this);
  }
  componentDidMount(){
    $('.tooltipped').tooltip();
  }
  componentWillUnmount(){
    $('.tooltipped').tooltip('remove');
  }
  handleClickColor(){
      this.setState({displayColorPicker: !this.state.displayColorPicker});
  }
  handleColorClose(){
      this.setState({displayColorPicker: false});
  }
  handleColorChange(color){
      this.setState({color: Object.assign({}, color.rgb, {updated: true}), updated: true});
  }
  renderImagePreview(picObj){
    if(picObj.isProcessing){
      return (
          <div className="progress">
              <div className="indeterminate"></div>
          </div>
      );
    }
    else if (picObj.fileURI != null) {
      return (
        <div className="col s12">
            <img src={picObj.fileURI} className="responsive-img"/>
        </div>
      );
    }
    else {
      return <h4 className="grey-text text-lighten-3">Image Preview</h4>;
    }
  }
  onImageChange(event){
      const file = event.target.files[0];
      if(file != null){
          this.setState({
              logo: Object.assign({}, this.state.logo, {
                  file,
                  isProcessing: true
              }),
              updated: true
          });
          
          const reader = new FileReader();
          reader.onload = (upload) => {
                this.setState({
                    logo: Object.assign({}, this.state.logo, {
                        isProcessing: false,
                        fileURI: upload.target.result,
                        updated: true
                    })
                })
          }
          reader.readAsDataURL(file);
      }
  }
  clearImage(){
      this.setState({
          logo: Object.assign({}, this.state.logo, {
              isProcessing: false,
              file: null,
              fileURI: null,
              updated: true
          }),
          updated: true
      });
  }
  onSaveClick () {
      const {logo, color} = this.state;
      let payload = {}
      if(logo['updated']){
          
          payload['logo'] = Object.assign({}, logo, {updated: undefined, fileName: logo.file.name, file: {name: logo.file.name}});
      }
      if(color['updated']){
          payload['primaryColor'] = Object.assign({}, color, {updated: undefined});
      }
      this.props.saveOrg(payload);
  }
  onResetClick(){
      const {organization} =this.props;
      let color = {
          r: 56,
          g: 70,
          b: 36,
          a: 1
      };
      let logo = {
          file: null,
          fileURI: null,
          isProcessing: false
      };
      if(organization != null){
          if(organization.primaryColor != null){
            color = organization.primaryColor;
          }
          if(organization.logo != null) {
            logo = organization.logo;
          }
      }
      this.setState({
          updated: false,
          logo: Object.assign({}, logo, {
              updated: false
          }),
          color: Object.assign({}, color, {
              updated: false
          })
      });
  }
  renderSpinner () {
        const {isFetching, isUpdatingOrg, isRequestingNewPassword} = this.props;
        if(isFetching || isUpdatingOrg || isRequestingNewPassword){
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
  render(){
    const styles = {
        color: {
          width: '10rem',
          height: '2rem',
          borderRadius: '2px',
          background: `rgba(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b }, ${ this.state.color.a })`,
        },
        swatch: {
          padding: '5px',
          background: '#fff',
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer',
        },
        popover: {
          position: 'absolute',
          zIndex: '2',
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        }
    };
    return (
      <div>
        <div className="row">
            <h1 className="text-padding icon-2">Settings</h1>
        </div>
        {/* <div className="row">
            <div className="divider"></div>
        </div> */}
        {this.renderSpinner()}
        <div className="row container">
          <div   className="row">
              <div className="w-col col s12">
                <label className="eval-field-label" htmlFor="orgName" >Organization Name</label>
                <input  type="text" placeholder="" id="orgName"  className="eval-input w-input-select"/>
              </div>
          </div>
          <div className="row">
          <div className="w-col col s12">
                  <label htmlFor="name" className="eval-field-label" >Name</label>
                  <input id="name"  type="text" placeholder="" className="eval-input w-input-select"/>
              </div>
          </div>
          <div className="row">
              <div className="w-col col s12">
                  <label className="eval-field-label" htmlFor="email" >Email</label>
                  <input id="email" type="text" placeholder=""  className="eval-input w-input-select"/>
              </div>
          </div>
          <div className="row">
              <div className="col s6 tooltipped" data-delay="50" data-position="top" data-tooltip="You can customize the header colors in the PDF by selecting a saving a color." style={{cursor: 'pointer'}}>
                <div className="col s6 input-field">
                    <label htmlFor="hexColor" className="eval-field-label">Hex Color</label>
                    {/* <input id="hexColor" disabled={true} value={Color([this.state.color.r, this.state.color.g, this.state.color.b, this.state.color.a]).hex()} 
                      type="text" placeholder="Pick a Color"  onClick={ this.handleClickColor }/> */}
                </div>
                <div className="col s6">
                    <div className="center" style={{marginTop: '1rem'}}>
                      <div style={ styles.swatch }  onClick={ this.handleClickColor }>
                        <div style={ styles.color } />
                      </div>
                      { this.state.displayColorPicker ? <div style={ styles.popover }>
                        <div style={ styles.cover } onClick={ this.handleColorClose }/>
                        <SketchPicker color={ this.state.color } onChange={ this.handleColorChange } />
                      </div> : null }
                    </div>
                </div>
              </div>
              {/* <div className="col s6">
                  <div className="col s6 tooltipped" data-delay="50" data-position="top" 
                  data-tooltip="Upload a logo and it will appear in all your future PDF downloads.">
                    <div className="file-field input-field">
                        <div className="btn">
                            <span>File</span>
                            <input type="file" id="file-uploader" onChange={this.onImageChange}/>
                        </div>
                        <div className="file-path-wrapper">
                            { this.state.logo.file != null || this.state.logo.fileURI != null ?
                                <i onClick={this.clearImage} className="material-icons prefix blue-grey-text"
                                   style={{paddingTop: '1%', cursor: 'pointer'}}>cancel</i>
                                : null}
                            <input value={this.state.logo.file == null ? '' : this.state.logo.file.name} className="file-path validate" type="text" placeholder="Logo"/>
                        </div>
                      </div>
                  </div>
                  <div className="col s6">
                      {this.renderImagePreview(this.state.logo)}
                  </div>
              </div> */}
          </div>
          <div className="row">
          <div className="col s6">
                  <div className="col s6 tooltipped" data-delay="50" data-position="top" 
                  data-tooltip="Upload a logo and it will appear in all your future PDF downloads.">
                    <div className="file-field input-field">
                        <div className="row">
                            <div className="submit-button inverse upload w-button" >File</div>
                            <input type="file" id="file-uploader" onChange={this.onImageChange}/>
                        </div>
                        <div className="file-path-wrapper">
                            { this.state.logo.file != null || this.state.logo.fileURI != null ?
                                <i onClick={this.clearImage} className="material-icons prefix blue-grey-text"
                                   style={{paddingTop: '1%', cursor: 'pointer'}}>cancel</i>
                                : null}
                            <input value={this.state.logo.file == null ? '' : this.state.logo.file.name} className="file-path validate" type="text" placeholder="Logo"/>
                        </div>
                      </div>
                  </div>
                  <div className="col s6">
                      {this.renderImagePreview(this.state.logo)}
                  </div>
              </div>
          </div>
          <div className="row">
              <div className="col s12"> 
                <button className="form-rounded" id="requestNewpPwd" onClick={() => this.props.requestPasswordReset(this.props.email)} 
                data-delay="50" data-position="top" data-tooltip="Request a new password.">Request Password Reset</button>
              </div>
          </div>
          <div className="row">
              <div className="col s6">
                <button className="form-rounded" id="reset"
                data-delay="50" data-position="top" data-tooltip="Reset Logo and Color back to saved values." onClick={this.onResetClick} disabled={!this.state.updated}>Reset</button>
              </div>
              <div className="col s6"> 
                <button className="form-rounded" id="save" onClick={this.onSaveClick} disabled={!this.state.updated}>Save</button>
              </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings)
