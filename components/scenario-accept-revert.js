import React, {Component, PropTypes} from "react";
import {connect} from "react-redux";
import Fab from "./common/fab";
import Popover from "material-ui/Popover";
import Menu from "material-ui/Menu";
import MenuItem from "material-ui/MenuItem";
import ScenarioSettingIcon from "material-ui/svg-icons/action/settings";
import {withRouter} from "react-router";
import {
    openSimulationScreenDashboardActionCreator
} from "./action-creators/dashboard-action-creator";
import {SOURCE_DISCRIMINATOR} from '../common/constants'
import {
    checkSimulationsExistsActionCreator,
    scenarioAcceptActionCreator,
    scenarioRevertActionCreator
} from "./action-creators/scenario-action-creator";

class ScenarioAcceptRevert extends Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false,
            isShowingRevertAlert: false,
            isShowingAcceptAlert: false,
        };
        this.hideAlert = this.hideAlert.bind(this);
    };

    handleTouchTap = (event) => {
        // This prevents ghost click.
        event.preventDefault();
        this.setState({
            open: true,
            anchorEl: event.currentTarget,
        });
    };

    hideAlert() {
        this.setState({
                isShowingAcceptAlert: false,
                isShowingRevertAlert: false
            }
        )
    }

    handleRequestClose = () => {
        this.setState({
            open: false,
        })
    };

    getMenuItems(props) {
        if (props.simulationsExists) {
            return (
                <Menu>
                    <MenuItem primaryText='Accept'
                              onClick={() => {
                                  props.onScenarioAccept();
                                  this.handleRequestClose();
                              }}/>

                    <MenuItem primaryText='Revert'
                              onClick={() => {
                                  props.onScenarioRevert();
                                  this.handleRequestClose();
                              }}/>
                </Menu>
            );
        }
    }

    componentWillMount() {
        if (!this.props.simulationsExists) {
            this.props.checkSimulationsExists();
        }
    }

    componentWillReceiveProps(nextProps) {
        let sourceDashboardId = nextProps.match.params.sourceDashboardId;
        this.props.loadDashboard(SOURCE_DISCRIMINATOR, sourceDashboardId);
    }

    isSimulationsExists(simulationsExists) {
        return (simulationsExists !== true);
    }

    render() {
        let self = this;
        let props = self.props;
        return (
            <span >
                <Fab id="scenario-dropdown-btn" action={self.handleTouchTap} className={this.props.className}
                     disabled={this.isSimulationsExists(props.simulationsExists)} color='rgb(255, 64, 129)'
                     dataTip="Accept/Revert Scenario" dataFor="change-scenario-btn-tip">
                  <ScenarioSettingIcon/>
                </Fab>
                <Popover
                    open={self.state.open}
                    anchorEl={self.state.anchorEl}
                    anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                    targetOrigin={{horizontal: 'left', vertical: 'top'}}
                    onRequestClose={self.handleRequestClose}>
                    {this.getMenuItems(props)}
                </Popover>
            </span>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        simulationsExists: state.scenario.simulationsExists,
        scenarioAccepted: state.scenario.accepted,
        scenarioReverted: state.scenario.reverted
    };
};

const mapDispatchToProps = ({
    onScenarioAccept: scenarioAcceptActionCreator,
    onScenarioRevert: scenarioRevertActionCreator,
    checkSimulationsExists: checkSimulationsExistsActionCreator,
    loadDashboard: openSimulationScreenDashboardActionCreator
});


ScenarioAcceptRevert.propTypes = {
    selectedScenario: PropTypes.object,
    handleAccept: PropTypes.func,
    handleRevert: PropTypes.func,
    className: PropTypes.string
};

ScenarioAcceptRevert = withRouter(connect(mapStateToProps, mapDispatchToProps)(ScenarioAcceptRevert));

export default ScenarioAcceptRevert
