import React, {Component} from "react";
import ReactDOM from "react-dom";
import {connect} from "react-redux";
import Dashboard from "./dashboard";
import {
    fetchTargetDashboardActionCreator,
    openSimulationScreenDashboardActionCreator
} from "./action-creators/dashboard-action-creator";
import {
    selectDashboardMetadata,
    selectUIAvailableFilters,
    selectUIDashboard
} from "./../selectors";
import SplitPane from "react-split-pane";
import "./simulation-screen.scss";
import FinalVMsToBeSimulatedContainer from "./bottom-sheet/final-vms-tobe-simulated-container";
import SimulationBarContainer from "./simulation-bar/simulation-bar-container";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import uniq from "lodash/uniq";
import concat from "lodash/concat";
import {withRouter} from 'react-router';
import Alert from "react-bootstrap/lib/Alert";
import {SOURCE_DISCRIMINATOR, TARGET_DISCRIMINATOR} from '../common/constants'


class SimulationScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            height: null,
            width: null,
            showBottomSheet: false,
            sourceDashboardId: null
        };
        this.onBottomSheetChange = this.onBottomSheetChange.bind(this);
    }

    componentDidMount() {
        let parentNode = ReactDOM.findDOMNode(this.refs.simulationScreenDiv);
        if (parentNode) {
            let height = parentNode.clientHeight;
            let width = parentNode.clientWidth;
            this.setState({height: height, width: width});
        }
    }

    loadDashboardsIfRequired(sourceDashboardId, targetDashboardId, nextQueryParam) {
        if (this.state.sourceDashboardId !== sourceDashboardId || this.props.location.search !== nextQueryParam) {
            this.props.loadDashboard(SOURCE_DISCRIMINATOR, sourceDashboardId);
            this.setState({sourceDashboardId});
        }
        if (!targetDashboardId || targetDashboardId === null) {
            this.props.loadTargetDashboard();
        }
    }

    getTargetDashboardId() {
        if (this.props.targetDashboard.id) {
            return this.props.targetDashboard.id;
        }
        else {
            return null;
        }
    }

    componentWillMount() {
        let sourceDashboardId = this.props.match.params.sourceDashboardId;
        let targetDashboardId = this.getTargetDashboardId();
        this.loadDashboardsIfRequired(sourceDashboardId, targetDashboardId);
    }

    componentWillReceiveProps(nextProps) {

        let sourceDashboardId = nextProps.match.params.sourceDashboardId;
        let targetDashboardId = this.getTargetDashboardId();
        let nextQueryParam = nextProps.location.search;
        this.loadDashboardsIfRequired(sourceDashboardId, targetDashboardId, nextQueryParam);
    }

    onBottomSheetChange() {
        this.setState({showBottomSheet: !this.state.showBottomSheet});
    }


    render() {
        if (this.props.location.search) {
            let colSpan = 4;
            return (
                <div ref="simulationScreenDiv">
                    <SplitPane split="vertical" minSize={window.innerWidth / 2} defaultSize={this.state.width / 2}>
                        <div>
                            <Dashboard dashboardMetadata={this.props.sourceDashboardMetadata}
                                       availableFilters={this.props.sourceAvailableFilters}
                                       dashboard={this.props.sourceDashboard}
                                       discriminator={SOURCE_DISCRIMINATOR}
                                       position="left"
                                       colSpan={colSpan}
                                       highlightedIds={this.props.highlightedSourceHostsAndVMs}
                                       showMetricsCards={false}/>
                        </div>
                        <div>
                            <Dashboard dashboardMetadata={this.props.targetDashboardMetadata}
                                       availableFilters={this.props.targetAvailableFilters}
                                       dashboard={this.props.targetDashboard}
                                       discriminator={TARGET_DISCRIMINATOR}
                                       position="right"
                                       colSpan={colSpan}
                                       highlightedIds={this.props.highlightedTargetHosts}
                                       showMetricsCards={false}/>
                        </div>
                    </SplitPane>


                    <SimulationBarContainer/>

                    <FinalVMsToBeSimulatedContainer/>
                </div>
            )
        }
        else {
            return (
                <div ref="splitScreenDiv">
                    <Alert bsStyle="danger">
                        <strong>Please select any scenario</strong>
                    </Alert>
                </div>
            )
        }

    }

}

const mapStateToProps = (state, ownProps) => {
    let simulationRequest = state.simulationRequest;
    let highlightedSourceHostsAndVMs;
    let highlightedTargetHosts;
    if (!isEmpty(simulationRequest)) {
        let sourceHosts = uniq(map(simulationRequest.simulations, "sourceHost"));
        let targetHosts = uniq(map(simulationRequest.simulations, "targetHost"));
        let vms = uniq(map(simulationRequest.simulations, "vm"));
        highlightedSourceHostsAndVMs = concat(sourceHosts, vms);
        highlightedTargetHosts = targetHosts;
    }


    return {
        highlightedSourceHostsAndVMs: highlightedSourceHostsAndVMs,
        highlightedTargetHosts: highlightedTargetHosts,
        sourceAvailableFilters: selectUIAvailableFilters(SOURCE_DISCRIMINATOR, state),
        sourceDashboardMetadata: selectDashboardMetadata(ownProps.match.params.sourceDashboardId, state),
        sourceDashboard: selectUIDashboard(SOURCE_DISCRIMINATOR, state),
        targetAvailableFilters: selectUIAvailableFilters(TARGET_DISCRIMINATOR, state),
        targetDashboardMetadata: selectDashboardMetadata(state.ui[TARGET_DISCRIMINATOR].id, state),
        targetDashboard: selectUIDashboard(TARGET_DISCRIMINATOR, state)
    }
};

const mapDispatchToProps = ({
    loadDashboard: openSimulationScreenDashboardActionCreator,
    loadTargetDashboard: fetchTargetDashboardActionCreator

});

SimulationScreen = withRouter(connect(
    mapStateToProps, mapDispatchToProps)(SimulationScreen));

export default SimulationScreen