import React, {Component, PropTypes} from "react";
import Fab from "./common/fab";
import Popover from "material-ui/Popover";
import Menu from "material-ui/Menu";
import MenuItem from "material-ui/MenuItem";
import ScenarioSettingIcon from "material-ui/svg-icons/action/settings";
import {Link} from "react-router-dom";
import {withRouter} from "react-router";

class ScenarioDropdown extends Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false
        };
    };

    handleTouchTap = (event) => {
        // This prevents ghost click.
        event.preventDefault();

        this.setState({
            open: true,
            anchorEl: event.currentTarget,
        });
    };


    handleRequestClose = () => {
        this.setState({
            open: false,
        });
    };

     checkScenarioChangePossibility(){
            console.log(this.props.location.pathname);
           if (this.props.location.pathname !== '/simulationResult')
                return false;
            else
                return true;
          }

    render() {
        let self = this;
        let scenarioChange = this.checkScenarioChangePossibility();
        return (
            <span >
                <Fab id="scenario-dropdown-btn" action={self.handleTouchTap} className={this.props.className}
                     color='rgb(255, 64, 129)' dataTip="Change scenario" dataFor="change-scenario-btn-tip" disabled={scenarioChange}>
                  <ScenarioSettingIcon/>
                </Fab>
                <Popover
                    open={self.state.open}
                    anchorEl={self.state.anchorEl}
                    anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                    targetOrigin={{horizontal: 'left', vertical: 'top'}}
                    onRequestClose={self.handleRequestClose}>
                <Menu>
                    {self.props.availableScenarios.map((s, i) => {
                        return (
                            <Link key={i} to={'?scenarioId=' + `${s.id}`}>
                                <MenuItem primaryText={s.name}
                                          onClick={() => {
                                              self.handleRequestClose();
                                          }}/>
                            </Link>
                        )
                    })
                    }
                </Menu>
                </Popover>
            </span>
        );
    }
}

export default withRouter(ScenarioDropdown)

ScenarioDropdown.propTypes = {
    availableScenarios: PropTypes.array.isRequired,
    selectedScenario: PropTypes.object,
    onScenarioChange: PropTypes.func,
    className: PropTypes.string
};