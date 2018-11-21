/**
 * Created by rayde on 11/14/2017.
 */
import React from 'react'

// const Header = ({displayName, sideNav, openNav, mDialog }) => (

//     <nav>
//         <div className="nav-wrapper">
//             <img src='/static/img/header_log.png' align="middle" className="image-3" style={{ width:65, height:65}}/>
//             <h1 className="heading-8">Ag</h1>
//             <h1 className="heading-9">Valuation</h1>




//             { <div data-hover="1" data-delay="0" className="dropdown w-dropdown">
//             <div className="dropdown-toggle-2 w-clearfix w-dropdown-toggle">
//             <div className="icon-2 w-icon-dropdown-toggle"></div>
//             <div className="text-block-10">JP</div>
//             </div>
//             <nav className="dropdown-list-2 w-dropdown-list">
//             <a href="#" data-w-id="9058a05f-e9b2-119d-d5a4-518f66822590" className="dropdown-link top w-dropdown-link">Settings</a>
//             <a href="#" className="dropdown-link bottom w-dropdown-link">Logout</a>
//             </nav>
//             </div> }




//             {/* <a  onClick={onClickSubmit} href="/evaluations/new" className="link-block-6 w-inline-block w-clearfix"> */}

//             {/* <a href="#" onClick={mDialog} className="link-block-6 w-inline-block w-clearfix">
//             <div className="div-block-9 add-new-button">
//             <h3 className="heading-4 add-new">Create New</h3>
//             </div>
//             </a> */}
//             <a href="#" onClick={mDialog} className="link-block-6 w-inline-block w-clearfix">
//             <div className="div-block-9 add-new-button">
//             <h3 className="heading-4 add-new">Create New</h3>
//             </div>
//             </a>


        





//             {/* <ul className="left" id="nav-mobile">
//                  <li>
//                     <a data-activates="side-nav" className="button-collapse"><i
//                         className="material-icons large">menu</i></a>
//                 </li>
//                 <li className="hide-on-med-and-down"><a onClick={openNav}><i className="material-icons e-value-text-yellow">menu</i></a></li>
//             </ul>
//             { <ul className="right hide-on-med-and-down" style={{paddingRight: '1rem'}}>
//                 <li><p className="e-value-text-yellow" style={{margin: '0'}}>{displayName}</p></li>
//             </ul> }
//             { sideNav} */}
//         </div>
//     </nav>
// );


class Header extends React.Component {
    constructor(props) {
      super(props);
        this.openMDialog = this.openMDialog.bind(this);
        this.setttingMDialog = this.setttingMDialog.bind(this);
    }
  
    componentDidMount() {
        $('#valuationModal').modal();
        $('#settingModal').modal();
    }
    componentWillUnmount(){
        $('#valuationModal').modal('close');
        $('#deleteEvasettingModallModal1').modal('close');
      }

    setttingMDialog()
    {
      $('#settingModal').modal('open');
    }
    openMDialog() {
      var evaluationValue = $("#evaluation").text().trim();    
      if (  evaluationValue == 'Create New' )
        $("#evaluation").attr("href", "/evaluations/new/")
      else
        $('#valuationModal').modal('open');
    }
    


    render() {
      const {logOut,goToSettings} = this.props;
      return (
        <nav>
        <div className="nav-bar">
            <img src='/static/img/header_log.png' align="middle" className="image-3" style={{ width:65, height:65}}/>
            <h1 className="heading-8">Ag</h1>
            <h1 className="heading-9">Valuation</h1>


            <div className="btn-group right" style={{ paddingRight:50,marginTop:8}}>
              <a className="text-block-10" data-toggle="dropdown">
                JP
                <span className="caret"></span>
              </a>
              <div className="dropdown-menu">
              <a  href="#" onClick={()=>this.setttingMDialog()} className="dropdown-link top w-dropdown-link">Settings</a>
              <a href="#" onClick={ () => logOut()} className="dropdown-link top w-dropdown-link">Logout</a>
              </div>
            </div> 




            <a className="createNew card right" id="evaluation" onClick={()=>this.openMDialog()} style={{fontSize:20,textAlign:"center"}}>
            </a>



             {/* <a id="evaluation" onClick={ ()=>this.openMDialog()} id="btnCreateNew" className="link-block-6 w-inline-block w-clearfix">
            <div className="div-block-9 add-new-button" >
            <h3 className="heading-4 add-new" id = "newEvaluation" >Create New</h3>
            </div>
            </a>  */}

        </div>
    </nav>
      );
    }
  }




export default Header
