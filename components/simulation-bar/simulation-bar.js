import React, {Component} from "react";
import Badge from 'material-ui/Badge';
import "./simulation-bar.scss";
import SimulateButtonContainer from "../simulate-button-container";
import GlobalMetricChangeButton from "./../global-metric-change-trigger-button";

class SimulationBar extends Component {
    render() {
        return (
            <div >
                <div className="simulation-bar" onClick={this.props.openBottomSheet}/>
                <div id="simulate-btn" className="floating-btn">
                    <SimulateButtonContainer/>
                </div>
                <div className="badgeLocation">
                    <Badge badgeContent={this.props.simulationsTotal} secondary={true}/>
                </div>
            </div>

        );
    }
}

export default SimulationBar;