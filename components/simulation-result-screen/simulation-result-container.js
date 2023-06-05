import {connect} from "react-redux";
import SimulationResultTab from "./simulation-result-tab";

const mapStateToProps = (state) => {
    return {
        margins: {top: 250, right: 0, bottom: 10, left: 400},
        heightFactor: 1200 - 120 - 10,
        widthFactor: 1600 - 10,
        colors: ["#357935", "#449d44", "#5cb85c", "#616f77", "#d9534f", "#c9302c", "#a02622"],
        simulationResult: state.simulationResponse,
        simulatedLicenseMetric:state.ui.targetLicenseMetric
    }
};

const SimulationResultContainer = connect(
    mapStateToProps
)(SimulationResultTab);

export default SimulationResultContainer