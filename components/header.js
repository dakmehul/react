import React, {Component} from "react";
import {connect} from "react-redux";
import Modal from "./common/modal";
import SingleScreenDashboardSelection from "./single-screen-dashboard-selection";
import SimulationScreenMetricSelection from "./simulation-screen-metric-selection";
import Fab from "./common/fab";
import ContentLaunch from "material-ui/svg-icons/action/launch";
//import ContentFlight from "material-ui/svg-icons/maps/flight";
import ContentSplit from "material-ui/svg-icons/communication/call-split";
import ScenarioAcceptRevert from "./scenario-accept-revert";
import "./Header.scss";
import ReactToolTip from "react-tooltip";
import {withRouter} from "react-router";
import Dialog from "material-ui/Dialog";
import GlobalFunctionsStepper from "./global-function-stepper/global-functions-stepper";
import GlobalMetricChangeButton from "./global-metric-change-trigger-button";
import {globalMetricChangeEndActionCreator} from "./action-creators/simulation-action-creator";

class Header extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isSingleModalOpen: false,
            isSimulationModalOpen: false,
            showGlobalFunctionDialog: false
        };
        this.toggleSingleModalPopup = this.toggleSingleModalPopup.bind(this);
        this.showGlobalFunctionDialog = this.showGlobalFunctionDialog.bind(this);
        this.hideGlobalFunctionDialog = this.hideGlobalFunctionDialog.bind(this);
        this.toggleSimulationModalPopup = this.toggleSimulationModalPopup.bind(this);
        this.hideModal = this.hideModal.bind(this);
    }

    showGlobalFunctionDialog() {
        this.setState({showGlobalFunctionDialog: true})
    }

    hideGlobalFunctionDialog() {
        this.setState({showGlobalFunctionDialog: false})
        this.props.onGlobalFunctionStepperDismiss()
    }

    toggleSingleModalPopup() {
        this.setState({isSingleModalOpen: !this.state.isSingleModalOpen})
    }

    toggleSimulationModalPopup() {
        this.setState({isSimulationModalOpen: !this.state.isSimulationModalOpen})
    }


    hideModal() {
        this.setState({
            isSingleModalOpen: false,
            isSimulationModalOpen: false
        })
    }

    // getScenarioId() {
    //     let path = this.props.location.search;
    //     let scenarioIdBegins = path.indexOf('=');
    //     let scenarioId = path.substring(scenarioIdBegins + 1);
    //
    //     let currentScenarioName = this.props.availableScenarios.find(function (f) {
    //         return f.id === scenarioId;
    //     });
    //
    //     if (currentScenarioName) {
    //         return currentScenarioName.name;
    //     }
    //     return '';
    // }
    //
    // checkScenarioContext() {
    //     return (this.props.location.search && this.props.location.pathname !== '/' && this.props.currentDimension !== 'VM');
    // }

    isGotoSimBtnToBeDisabled() {
        let props = this.props;
        let viz = props.viz;
        if (props.currentDimension === "VM") return true;
        else if (localStorage.getItem("targetLicenseMetric") !== "" && props.targetDashboardId !== undefined) return true;
        else if (viz) {
            if (viz.jsonClass === "HiveDefinition") return true;
        } else return props.selectedTargetLicenseMetric === '';
    }

    isGlobalMetricDisabled(){
       let currentPath = this.props.location.pathname
       console.log("current path")
       console.log(this.props.location.pathname)
       if (this.props.location.pathname === "/")
            return true;
       else return false
    }

    render() {
        /*let scenarioContext = this.checkScenarioContext();*/
        let props = this.props;
        let goToSimBtnDisabled = this.isGotoSimBtnToBeDisabled();
        let globalMetricDisabled = this.isGlobalMetricDisabled();
        return (
            <div className='appBar'>
                <Modal isOpen={this.state.isSingleModalOpen} title='Select the Dashboard to open'
                       hideModal={this.toggleSingleModalPopup}>
                    <SingleScreenDashboardSelection onDashboardSelection={this.toggleSingleModalPopup}/>
                </Modal>


                <Dialog
                    title="Global Simulations"
                    modal={false}
                    bodyStyle={{width: '100%', maxWidth: 1500}}
                    contentStyle={{width: '100%', maxWidth: 1500, margin: '0 auto'}}
                    open={this.state.showGlobalFunctionDialog}
                    onRequestClose={this.hideGlobalFunctionDialog}>
                    <GlobalFunctionsStepper
                                            handleClose={this.hideGlobalFunctionDialog}
                                            style={{'fontSize': '24px', 'padding': '10px'}}/>
                </Dialog>
                <div className="branding">
                    <a className="brand"><span className="ila img-responsive img-rounded"/></a>

                    <div className="pull-right" id="globalFab">
                        {/*<span className="scenarioLabel">{this.getScenarioId()}</span>*/}
                        <ScenarioAcceptRevert id='scenario-accept-revert' className="scenario-settings"/>
                        <GlobalMetricChangeButton targetLicenseMetric={props.targetLicenseMetric}
                                                  action={this.showGlobalFunctionDialog} disabled={globalMetricDisabled} />
                        <Fab id="simulation-screen-btn"
                             action={this.toggleSimulationModalPopup} secondary={true} dataTip="Go to simulation"
                             dataFor="simulation-screen-btn-tip" disabled={goToSimBtnDisabled}>
                            <ContentSplit/>
                        </Fab>

                        <ReactToolTip/>
                        <Fab id="open-screen-btn"
                             action={this.toggleSingleModalPopup} icon='fa fa-folder-open' secondary={true}
                             dataTip="Open dashboard" dataFor="open-screen-btn-tip">
                            <ContentLaunch/>
                        </Fab>
                        {/*<Fab id="intro-btn" icon='fa fa-plane'
                         action={() => {
                         console.log("on click of intro button");
                         return <h1>intro</h1>
                         }} secondary={true} dataTip="Start tour" dataFor="intro-btn-tip">
                         <ContentFlight />
                         </Fab>*/}
                        <ReactToolTip id="simulation-screen-btn-tip" effect="solid" place="bottom"/>
                        <ReactToolTip id="open-screen-btn-tip" effect="solid" place="bottom"/>
                        <ReactToolTip id="intro-btn-tip" effect="solid" place="left"/>
                        <ReactToolTip id="change-scenario-btn-tip" effect="solid" place="bottom"/>
                    </div>
                </div>
                <SimulationScreenMetricSelection selectedProduct={props.selectedProduct}
                                                 hideModal={this.toggleSimulationModalPopup}
                                                 isOpen={this.state.isSimulationModalOpen}/>
            </div>

        );
    }
}

const checkIsSimulationScreen = (state) => {
    return !!(state.ui.source.availableFilters)
};

const getSelectedMetric = () => {
    let foundTargetMetric = localStorage.getItem('targetLicenseMetric');
    return (foundTargetMetric !== undefined) ? foundTargetMetric : '';
};

const mapStateToProps = (state) => {
    let ui = state.ui;
    return {
        currentDimension: ui.single.dimension,
        selectedTargetLicenseMetric: getSelectedMetric(),
        isSimulationScreen: checkIsSimulationScreen(state),
        viz: ui.single.visualizations[0],
        targetDashboardId: ui.target.id,
        isScenarioReady:state.scenarioReadiness.isScenarioReady
    }
};

const mapDispatchToProps = ({
    onGlobalFunctionStepperDismiss : globalMetricChangeEndActionCreator
})

Header = withRouter(connect(
    mapStateToProps,mapDispatchToProps)(Header));

export default Header